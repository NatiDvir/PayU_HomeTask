# PayU Home Assignment - In-Memory Users API

## Changelog (Version 1.1)
* **Dynamic Age Calculation**: Age is now calculated dynamically from DOB at the time of request, ensuring up-to-date accuracy.
* **Optimized Deletion**: User deletion is now O(1) with the use of an index map, improving performance by swapping and popping users.
* **API Tests Added**: API-level tests have been implemented for all endpoints.

## Overview
This project implements a memory-based API that handles user data stored in data.csv. 
It supports multiple operations to get single or multiple users based on different attributes (ID, country, age, and name), and delete users by ID.
The solution is built with performance in mind, ensuring optimal data retrieval using appropriate data structures and following scalable and maintainable architecture.

## Design Decisions
### **1. Data Structure Choices**:
To optimize the efficiency of the operations (focusing get operations), I used the following data structures:

Maps for Fast Lookups (O(1)):

For attributes like ID, country, age and names (Both full or partial matching), I used Maps to store and retrieve users in O(1) time complexity. Each attribute acts as the key, and the corresponding users are stored as values.
* **usersIdMap**: Stores users by their unique ID for fast lookups.
* **usersCountryMap**: Stores users list by their country,  allowing getting users by country.
* **usersDobMap**: Stores users list by their DOB, allowing getting users by age.
* **usersPrefixMap**: Stores users list by their full name, first/last names, or their by name Prefix (Minimum of 3 chars).
* **indexesMap**: Stores users indexes within all maps to ensure optimal deletion time complexity of O(1) by a swap-and-pop logic.

### **2. Why I Chose Prefix Map Over Trie**
While a Trie could be used for prefix matching, I chose the Prefix Map for the following reasons:

* Memory Efficiency: Since a Prefix Map stores entire prefixes as keys, it consumes less memory compared to a Trie, which stores each character individually in its nodes.
* Similar Worst-Case Complexity: Both Trie and Prefix Map have similar time complexities in the worst case - when all users have the same prefix or come from the same country, but the Prefix Map offers constant-time lookups for precomputed prefixes, providing a more direct and efficient solution.
* To support partial and full name matching, I implemented a prefix map for names. Each prefix (of at least 3 characters) is stored as a key, and the value is an array of users whose names match that prefix.
This approach provides efficient lookups for name searches, supporting both full matches and partial matches.

To summeries - the prefix map provides a simpler and more memory-efficient solution given the scope of this task, and has the same complexity as Trie on worse cases.

### **3. Architecture & Design Pattern**:
To improve code structure and maintainability, I implemented the following design:

Controller: 
The UserController handles incoming HTTP requests, Validates the query values, and uses UserModel layer to perform operations like getting or deleting users.

MemoryDB:
The MemoryDB layer is responsible for creating efficient in-memory mappings for users by ID, country, age, and name. This allows faster data fetching, optimizing performance as the dataset grows.

Model:
The UserModel is responsible for representing the data structure of user object, and logic for data access.

### **4. Handling Large-Scale Data in Memory**
This solution may still face limitations as the data csv grows exponentially, increasing memory usage and potentialy reaching to its limitation.
Using indexes/pointers arrays instead of Users array would save memory, but it would require has going through o(n) user on worse case for retrieving the actual the User data.

# API Endpoints:
```
Get user by Id
    - GET /users/a2ee2667-c2dd-52a7-b9d8-1f31c3ca4eae
    - return the requested user details 

Example response:
{
    "id": "ae8da2bf-69f6-5f40-a5e6-2f1fedb5cea6",
    "name": "Ricardo Wise",
    "dob": "13/1/1973",
    "country": "AE"
}

Get users list by country
    - GET /users?country=US
    - return a list of all users from requested country

Get users list by age
    - GET /users?age=30
    - return all users which are of age 30 at the time of the request

Get users list by name
    - GET /users?name=Susan
    - return all users which name matches the requested name
    - Matching names rules:
        - Full match - for input "Susan James" - returns all users with name "Susan James".
        - Full first name or last name - for input "Susan" returns all users with that first or last name.
        - Partial match (minimum 3 chars) - for input "Sus", should returns all users with first or last name that begin with "Sus".
        - Support non case sensitive search (Searching for "susan" should return users with name "Susan").

Example response for list of users:
[    
    {
        "id": "ae8da2bf-69f6-5f40-a5e6-2f1fedb5cea6",
        "name": "Ricardo Wise",
        "dob": "13/1/1973",
        "country": "AE"
    }
]

Delete user by id
    - DELETE /users/a2ee2667-c2dd-52a7-b9d8-1f31c3ca4eae
    - Delete the user, after the call the user will not be returned by any of the previous APIs.
```

# Installation
---

### Clone the repository
```
git clone https://github.com/NatiDvir/PayU_HomeTask.git
```

### Navigate to root folder
```
cd PayU_HomeTask
```
### Start up the service
```
npm install
node index.js
```
### Running Tests
```
npm test
```
