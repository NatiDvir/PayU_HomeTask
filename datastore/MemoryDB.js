class MemoryDB {
    constructor() {
      this.usersIdMap = new Map();
      this.usersCountryMap = new Map();
      this.usersAgeMap = new Map();
      this.usersPrefixMap = new Map();
    }

    /**
     * Loads data from a CSV file and maps users by ID, country, age, and name prefixes for efficient lookups.
    */
    loadData(csvData) {
      const rows = csvData.split('\n').slice(1);
      rows.forEach((row, index) => {
        const [id, email, name, dob, country] = row.split(',');

        // Skip the current user if attributes are invalid
        if (!id || !email || !name || !dob || !country) {
            console.warn(`Invalid data at row ${index + 2}: ${row}`);
            return; 
        }

        // Required here to prevent circular dependency
        const User = require('../models/users');

        const user = new User(id, email, name, dob, country);
        const [firstName, lastName] = user.name.toLowerCase().split(' ');
        const age = user.getAge();
  
        // Map by id
        this.usersIdMap.set(user.id, user);
  
        if (!this.usersCountryMap.has(user.country)) {
          this.usersCountryMap.set(user.country, []);
        }
        this.usersCountryMap.get(user.country).push(user);
  
        if (!this.usersAgeMap.has(age)) {
          this.usersAgeMap.set(age, []);
        }
        this.usersAgeMap.get(age).push(user);
        
        // Map by full name
        if (!this.usersPrefixMap.has(name.toLowerCase())){
            this.usersPrefixMap.set(name.toLowerCase(), [])
        }
        this.usersPrefixMap.get(name.toLowerCase()).push(user);

        // Map by partial name
        [firstName, lastName].forEach((name) => {
          if (name) this.addToNamePrefix(name, user);
        });
      });
    }
  
    addToNamePrefix(name, user) {
        for (let i = 3; i <= name.length; i++) {
            const prefix = name.slice(0, i);
            if (!this.usersPrefixMap.has(prefix)) {
              this.usersPrefixMap.set(prefix, []);
            }
            this.usersPrefixMap.get(prefix).push(user);
        }
    }
}
  
module.exports = new MemoryDB();
  