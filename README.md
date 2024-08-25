# Real-Time Chat Application

## Overview

This is a real-time chat application built with Node.js, Express.js, Socket.IO, and MongoDB. It supports user authentication, message history retrieval, and group chat functionality. The application is dockerized for easy deployment.

## Features

- User authentication with JWT
- Real-time messaging using Socket.IO
- Message history retrieval with pagination
- Group chat creation and messaging
- Dockerized application for easy deployment

## Technologies

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-Time Communication:** Socket.IO
- **Authentication:** JWT
- **Containerization:** Docker


##setup

npm install

JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_uri

npm start


## API Documentation

### User Authentication

#### Register User

- **Endpoint:** `/api/register`
- **Method:** `POST`
- **Description:** Register a new user.
- **Request Body:**


{
  "message": "Registration successful"
}


## Login User

Endpoint: /api/login

Method: POST

Description: Authenticate a user and return a JWT token.

Request Body:

json
{
  "email": "user@example.com",
  "password": "password123"
}


## Messaging
Send Message
Endpoint: /api/messages

Method: POST

Description: Send a new message to a user or a group.

Request Body:

{
  "senderId": "sender-id",
  "receiverId": "receiver-id",  // Optional for group messages
  "groupId": "group-id",        // Optional for direct messages
  "content": "Hello, World!"
}



### Get Message History
Endpoint: /api/messages/history

Method: GET

Description: Retrieve message history between two users or within a group.

Query Parameters:

userId (required): The ID of the user whose message history is being retrieved.
withUserId (optional): The ID of the other user for direct messages.
groupId (optional): The ID of the group for group messages.
page (optional): The page number for pagination.
pageSize (optional): The number of messages per page.


output:- 
[
  {
    "senderId": "sender-id",
    "receiverId": "receiver-id",
    "groupId": "group-id",
    "content": "Hello, World!",
    "timestamp": "2024-08-25T12:00:00Z"
  }
]


##  Group Chat
Create Group
Endpoint: /api/groups

Method: POST

Description: Create a new group chat.

Request Body:
{
  "name": "Group Name",
  "members": ["member-id1", "member-id2"]
}


response:-
{
  "group": {
    "id": "group-id",
    "name": "Group Name",
    "members": ["member-id1", "member-id2"]
  }
}


#### Send Group Message
Endpoint: /api/groups/{groupId}/messages

Method: POST

Description: Send a message to a group.

Request Body:

json
Copy code
{
  "senderId": "sender-id",
  "content": "Group message content"
}
Response:

Success:

json
Copy code
{
  "success": true,
  "message": "Group message content"
}
Error:

json
Copy code
{
  "message": "Error message"
}

