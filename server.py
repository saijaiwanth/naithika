import http.server
import socketserver
import json

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def address_string(self):
        # Prevent slow reverse DNS lookups that freeze the local server
        return self.client_address[0]
        
    def do_POST(self):
        # Respond with disabled status since login is removed
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        response = {"status": "disabled", "message": "Authentication feature is disabled."}
        self.wfile.write(json.dumps(response).encode('utf-8'))

if __name__ == "__main__":
    # Allow address reuse so the socket is freed immediately when stopped
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving files at http://localhost:{PORT}")
        httpd.serve_forever()
