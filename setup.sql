CREATE DATABASE orsomworld;

CREATE TABLE users (id SERIAL PRIMARY KEY, username VARCHAR(50), password VARCHAR(50), idofcurrentchat INT);
CREATE TABLE chats (id SERIAL PRIMARY KEY, title VARCHAR(50));
CREATE TABLE peopleinchat (chat_id INT, user_id VARCHAR(50), username VARCHAR(50));
CREATE TABLE chatsyouarein (chat_id INT, chattitle VARCHAR(50), user_id INT);
CREATE TABLE messages (id SERIAL PRIMARY KEY, chat_id INT, message_type VARCHAR(4), messagetosend TEXT, personmessagefrom VARCHAR(50));

CREATE TABLE adminsofchat (chat_id INT, username VARCHAR(50), user_id INT);

ALTER TABLE chatsyouarein RENAME COLUMN chat_id TO id;

SELECT * FROM users;