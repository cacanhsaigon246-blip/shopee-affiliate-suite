import ftplib
import os

FTP_HOST = "187.127.126.46"
FTP_USER = "u972437838"
FTP_PASS = "Cannabis041188@"
LOCAL_DIR = r"C:\Users\SAIGONCACANH\.gemini\antigravity\scratch\shopee-affiliate-suite"
REMOTE_SUBDIR = "public_html/aff"

def upload_files():
    print(f"Connecting to FTP {FTP_HOST}...")
    ftp = ftplib.FTP()
    ftp.connect(FTP_HOST, 21, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    print("FTP Login Successful!")

    # Check/Create remote directory structure
    dirs = REMOTE_SUBDIR.split('/')
    for d in dirs:
        if d:
            try:
                ftp.cwd(d)
            except ftplib.error_perm:
                print(f"Creating directory: {d}")
                ftp.mkd(d)
                ftp.cwd(d)

    print(f"Current Remote Working Directory: {ftp.pwd()}")

    # Helper function to upload directory recursively
    def upload_dir_recursive(local_path):
        for item in os.listdir(local_path):
            # Skip hidden files, git, chrome-extension, google-sheets, telegram-bot
            if item.startswith('.') or item in ['chrome-extension', 'google-sheets', 'telegram-bot', 'upload_ftp.py']:
                continue
            
            local_file_path = os.path.join(local_path, item)
            
            if os.path.isfile(local_file_path):
                print(f"Uploading File: {item} ...")
                with open(local_file_path, 'rb') as f:
                    ftp.storlines(f'STOR {item}', f) if item.endswith(('.html', '.js', '.css', '.gs', '.txt', '.md', '.json')) else ftp.storbinary(f'STOR {item}', f)
            elif os.path.isdir(local_file_path):
                print(f"Uploading Subdirectory: {item} ...")
                try:
                    ftp.cwd(item)
                except ftplib.error_perm:
                    ftp.mkd(item)
                    ftp.cwd(item)
                
                upload_dir_recursive(local_file_path)
                ftp.cwd('..')

    upload_dir_recursive(LOCAL_DIR)
    ftp.quit()
    print("All files uploaded successfully!")

if __name__ == '__main__':
    upload_files()
