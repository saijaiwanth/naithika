import http.server
import socketserver
import json
import os
import bcrypt
import mysql.connector

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def address_string(self):
        # Prevent slow reverse DNS lookups that freeze the local server
        return self.client_address[0]
        
    def do_POST(self):
        if self.path == '/auth.php' or self.path == '/server.py' or self.path.endswith('auth.php') or self.path.endswith('server.py'):
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length)
            
            try:
                data = json.loads(body.decode('utf-8'))
            except json.JSONDecodeError:
                data = {}

            action = data.get('action', '')
            response = {"status": "error", "message": "Invalid action."}

            try:
                # Load env variables manually from .env file
                if os.path.exists('.env'):
                    with open('.env') as f:
                        for line in f:
                            if '=' in line and not line.strip().startswith('#'):
                                k, v = line.strip().split('=', 1)
                                os.environ[k] = v
                
                db_host = os.environ.get('DB_HOST', 'localhost')
                db_user = os.environ.get('DB_USER', 'root')
                db_pass = os.environ.get('DB_PASS', '')
                db_name = os.environ.get('DB_NAME', 'naithika')

                # Connect to MySQL (without specifying db to ensure we can create it)
                conn = mysql.connector.connect(host=db_host, user=db_user, password=db_pass)
                cursor = conn.cursor()
                
                # Create DB and select it
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
                cursor.execute(f"USE {db_name}")

                # Create users table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        contact_number VARCHAR(20) NOT NULL UNIQUE,
                        email VARCHAR(100) NOT NULL UNIQUE,
                        address TEXT NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        login_count INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()

                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN login_count INT DEFAULT 0")
                    conn.commit()
                except:
                    pass

                if action == 'register':
                    name = data.get('name', '').strip()
                    contact = data.get('contact_number', '').strip()
                    email = data.get('email', '').strip()
                    address = data.get('address', '').strip()
                    password = data.get('password', '')

                    cursor.execute("SELECT email, contact_number FROM users WHERE email = %s OR contact_number = %s", (email, contact))
                    row = cursor.fetchone()
                    if row:
                        if row[0] == email:
                            response = {"status": "error", "message": "User already exists with this Email ID."}
                        else:
                            response = {"status": "error", "message": "User already exists with this Contact Number."}
                    else:
                        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                        cursor.execute("INSERT INTO users (name, contact_number, email, address, password) VALUES (%s, %s, %s, %s, %s)", 
                                       (name, contact, email, address, hashed.decode('utf-8')))
                        conn.commit()
                        user_id = cursor.lastrowid
                        user_data = {
                            "id": user_id, "name": name, "contact_number": contact, "email": email, "address": address
                        }
                        response = {"status": "success", "message": "Registration successful!", "user": user_data}
                
                
                elif action == 'check_exists':
                    field = data.get('field', '')
                    value = data.get('value', '').strip()
                    if field in ['email', 'contact_number']:
                        cursor.execute(f"SELECT id FROM users WHERE {field} = %s", (value,))
                        if cursor.fetchone():
                            response = {"status": "exists", "message": f"User already exists with this {'Email ID' if field=='email' else 'Contact Number'}."}
                        else:
                            response = {"status": "available"}
                    else:
                        response = {"status": "error", "message": "Invalid field."}

                elif action == 'login':
                    username = data.get('username', '').strip()
                    password = data.get('password', '')
                    cursor.execute("SELECT id, name, email, contact_number, address, password FROM users WHERE email = %s OR contact_number = %s", (username, username))
                    row = cursor.fetchone()
                    if row:
                        hashed = row[5].encode('utf-8')
                        if bcrypt.checkpw(password.encode('utf-8'), hashed):
                            cursor.execute("UPDATE users SET login_count = login_count + 1 WHERE id = %s", (row[0],))
                            conn.commit()
                            user_data = {
                                "id": row[0], "name": row[1], "email": row[2], "contact_number": row[3], "address": row[4]
                            }
                            response = {"status": "success", "message": "Login successful", "user": user_data}
                        else:
                            response = {"status": "error", "message": "Invalid password."}
                    else:
                        response = {"status": "error", "message": "User not found. Please register."}

                
                elif action == 'update_profile':
                    user_id = data.get('id')
                    name = data.get('name', '').strip()
                    contact = data.get('contact_number', '').strip()
                    email = data.get('email', '').strip()
                    address = data.get('address', '').strip()
                    
                    # Check duplicates for other users
                    cursor.execute("SELECT id FROM users WHERE (email = %s OR contact_number = %s) AND id != %s", (email, contact, user_id))
                    if cursor.fetchone():
                        response = {"status": "error", "message": "Email or Contact Number already in use by another account."}
                    else:
                        cursor.execute("UPDATE users SET name=%s, contact_number=%s, email=%s, address=%s WHERE id=%s",
                                       (name, contact, email, address, user_id))
                        conn.commit()
                        user_data = {
                            "id": user_id, "name": name, "contact_number": contact, "email": email, "address": address
                        }
                        response = {"status": "success", "message": "Profile updated successfully!", "user": user_data}

                cursor.close()
                conn.close()

            except mysql.connector.Error as err:
                response = {"status": "error", "message": f"Database error: {err}"}
            except Exception as e:
                response = {"status": "error", "message": str(e)}

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_error(404, "File not found.")

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving files and APIs at http://localhost:{PORT}")
        httpd.serve_forever()
