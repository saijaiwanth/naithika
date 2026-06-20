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
                        whatsapp_joined TINYINT(1) DEFAULT 0,
                        reset_otp VARCHAR(6) DEFAULT NULL,
                        reset_otp_expiry DATETIME DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()

                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN login_count INT DEFAULT 0")
                    conn.commit()
                except:
                    pass

                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN whatsapp_joined TINYINT(1) DEFAULT 0")
                    conn.commit()
                except:
                    pass

                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN reset_otp VARCHAR(6) DEFAULT NULL")
                    conn.commit()
                except:
                    pass

                try:
                    cursor.execute("ALTER TABLE users ADD COLUMN reset_otp_expiry DATETIME DEFAULT NULL")
                    conn.commit()
                except:
                    pass

                if action == 'register':
                    name = data.get('name', '').strip()
                    contact = data.get('contact_number', '').strip()
                    email = data.get('email', '').strip()
                    address = data.get('address', '').strip()
                    password = data.get('password', '')
                    whatsapp_joined = int(data.get('whatsapp_joined', 0))

                    cursor.execute("SELECT email, contact_number FROM users WHERE email = %s OR contact_number = %s", (email, contact))
                    row = cursor.fetchone()
                    if row:
                        if row[0] == email:
                            response = {"status": "error", "message": "User already exists with this Email ID."}
                        else:
                            response = {"status": "error", "message": "User already exists with this Contact Number."}
                    else:
                        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                        cursor.execute("INSERT INTO users (name, contact_number, email, address, password, whatsapp_joined) VALUES (%s, %s, %s, %s, %s, %s)", 
                                       (name, contact, email, address, hashed.decode('utf-8'), whatsapp_joined))
                        conn.commit()
                        user_id = cursor.lastrowid
                        user_data = {
                            "id": user_id, "name": name, "contact_number": contact, "email": email, "address": address, "whatsapp_joined": whatsapp_joined
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

                elif action == 'forgot_password':
                    email = data.get('email', '').strip()
                    if not email:
                        response = {"status": "error", "message": "Email is required."}
                    else:
                        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
                        if not cursor.fetchone():
                            response = {"status": "error", "message": "No account found with this email address."}
                        else:
                            import random
                            from datetime import datetime, timedelta
                            otp = str(random.randint(100000, 999999))
                            expiry = (datetime.now() + timedelta(minutes=10)).strftime('%Y-%m-%d %H:%M:%S')
                            
                            cursor.execute("UPDATE users SET reset_otp = %s, reset_otp_expiry = %s WHERE email = %s", (otp, expiry, email))
                            conn.commit()
                            
                            # Try to send email
                            try:
                                import smtplib
                                from email.mime.text import MIMEText
                                from email.mime.multipart import MIMEMultipart
                                
                                msg = MIMEMultipart()
                                msg['From'] = 'naithikafoods@gmail.com'
                                msg['To'] = email
                                msg['Subject'] = 'Password Reset OTP - Naithika Foods'
                                
                                body = f"""
                                <html>
                                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                    <h2 style="color: #e97b06; text-align: center;">Naithika Foods</h2>
                                    <hr style="border: 0; border-top: 1px solid #eee;">
                                    <p>Hello,</p>
                                    <p>We received a request to reset your password. Use the following 6-digit One-Time Password (OTP) to proceed. This OTP is valid for 10 minutes.</p>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #333; background: #f9f9f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #e97b06;">{otp}</span>
                                    </div>
                                    <p>If you did not request this, you can safely ignore this email.</p>
                                    <p>Best regards,<br>Naithika Foods Team</p>
                                </body>
                                </html>
                                """
                                msg.attach(MIMEText(body, 'html'))
                                
                                smtp_server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
                                smtp_server.login('naithikafoods@gmail.com', 'rlehmfsogwgvenaz')
                                smtp_server.sendmail('naithikafoods@gmail.com', email, msg.as_string())
                                smtp_server.quit()
                            except Exception as mail_err:
                                print("Local mail sending error:", mail_err)
                            
                            print(f"\n[LOCAL TEST OTP] Password reset OTP for {email} is: {otp}\n")
                            response = {"status": "success", "message": "OTP sent successfully to your email."}

                elif action == 'reset_password':
                    email = data.get('email', '').strip()
                    otp = data.get('otp', '').strip()
                    password = data.get('password', '')
                    
                    if not email or not otp or not password:
                        response = {"status": "error", "message": "All fields are required."}
                    else:
                        cursor.execute("SELECT reset_otp, reset_otp_expiry FROM users WHERE email = %s", (email,))
                        row = cursor.fetchone()
                        if not row:
                            response = {"status": "error", "message": "User not found."}
                        else:
                            from datetime import datetime
                            db_otp = row[0]
                            db_expiry = row[1]
                            
                            if isinstance(db_expiry, str):
                                db_expiry = datetime.strptime(db_expiry, '%Y-%m-%d %H:%M:%S')
                            
                            now = datetime.now()
                            if db_otp != otp or now > db_expiry:
                                response = {"status": "error", "message": "Invalid or expired OTP."}
                            else:
                                import bcrypt
                                hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
                                cursor.execute("UPDATE users SET password = %s, reset_otp = NULL, reset_otp_expiry = NULL WHERE email = %s",
                                               (hashed.decode('utf-8'), email))
                                conn.commit()
                                response = {"status": "success", "message": "Password reset successfully. You can now login."}

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
