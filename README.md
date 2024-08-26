# Real-Time Chat API

## Overview

Welcome to the Real-Time Chat API! This API enables real-time communication between users, allowing them to send direct messages, participate in group chats, and manage their accounts. 

### Base URL

http://localhost:8000


## Getting Started

### Prerequisites

- Ensure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
Install dependencies using npm i


npm install
Start the server:

bash
Copy code
npm start
Test the API:

Open your browser and go to http://localhost:8000/api-docs to explore and test the API using the automatically generated documentation.



## Table of Contents

- [Authentication](#authentication)
  - [Register a New User](#register-a-new-user)
  - [User Login](#user-login)
- [Messages](#messages)
  - [Send a New Message](#send-a-new-message)
  - [Retrieve Message History](#retrieve-message-history)
- [Groups](#groups)
  - [Create a New Group Chat](#create-a-new-group-chat)
  - [Send a Message to a Group](#send-a-message-to-a-group)

## Authentication

### Register a New User

- **Endpoint:** `/api/register`
- **Method:** `POST`
- **Description:** Register a new user by providing their username, email, password, and confirmation password.

#### Request Body

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmpassword": "string"
}
Responses
200 OK: User registered successfully.
400 Bad Request: Missing or invalid parameters.
500 Internal Server Error: Server encountered an error.
User Login
Endpoint: /api/login
Method: POST
Description: Authenticate a user and return a JWT token for subsequent requests.
Request Body
json
Copy code
{
  "email": "string",
  "password": "string"
}
Responses 
200 OK: JWT token returned.
401 Unauthorized: Invalid credentials.
500 Internal Server Error: Server encountered an error.
Messages
Send a New Message
Endpoint: /api/messages
Method: POST
Description: Send a new message from one user to another, or to a group.
Request Body
json
Copy code
{
  "senderId": "string",
  "receiverId": "string",
  "groupId": "string (nullable)",
  "content": "string"
}
Responses
200 OK: Message sent successfully.
400 Bad Request: Missing or invalid parameters.
500 Internal Server Error: Server encountered an error.
Retrieve Message History
Endpoint: /api/messages/history
Method: GET
Description: Retrieve the message history between users or within a group.
Query Parameters
userId (required): ID of the user.
withUserId: ID of the other user in a direct message conversation.
groupId (optional): ID of the group chat.
page: Page number for pagination.
pageSize: Number of messages per page.
Responses
200 OK: Message history retrieved successfully.
400 Bad Request: Missing or invalid parameters.
500 Internal Server Error: Server encountered an error.
Groups
Create a New Group Chat
Endpoint: /api/groups
Method: POST
Description: Create a new group chat by specifying the group name and members.
Request Body
json
Copy code
{
  "name": "string",
  "members": ["string"]
}
Responses
200 OK: Group created successfully.
400 Bad Request: Missing or invalid parameters.
500 Internal Server Error: Server encountered an error.
Send a Message to a Group
Endpoint: /api/groups/{groupId}/messages
Method: POST
Description: Send a message to a specific group.
URL Parameters
groupId (required): ID of the group.
Request Body
json
Copy code
{
  "senderId": "string",
  "content": "string"
}
Responses
200 OK: Group message sent successfully.
400 Bad Request: Missing or invalid parameters.
500 Internal Server Error: Server encountered an error.
Security
This API uses JWT (JSON Web Token) for authentication. The token should be included in the Authorization header of requests, without the 'Bearer' prefix.

Example Header
makefile
Copy code
Authorization: <JWT_TOKEN>
Error Handling
The API returns standard HTTP status codes to indicate the success or failure of requests:

200 OK: The request was successful.
400 Bad Request: There was an issue with the request data.
401 Unauthorized: Authentication failed.
500 Internal Server Error: The server encountered an unexpected condition.
