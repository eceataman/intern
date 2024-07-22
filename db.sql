CREATE DATABASE takim7_auth_db;

-- connection string'le db'ye bağlan

CREATE TABLE Users (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(16) UNIQUE NOT NULL,
    pwd_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

CREATE INDEX idx_users_username ON Users(username);

-- aşağısı aşırı low priority

CREATE TABLE PasswordResets (
    reset_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    token VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Sessions (
    session_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_sessions_user_id ON Sessions(user_id);