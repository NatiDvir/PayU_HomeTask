class MemoryDB {
  constructor() {
      this.usersIdMap = new Map();
      this.usersCountryMap = new Map();
      this.usersDobMap = new Map();
      this.usersPrefixMap = new Map();
      this.indexesMap = new Map();  
  }

  /**
   * Loads data from a CSV file and maps users by ID, country, age, and name prefixes for efficient lookups.
   */
  loadData(csvData) {
      const rows = csvData.split('\n').slice(1);
      rows.forEach((row, index) => {
          const [id, email, name, dob, country] = row.split(',');
          
          if (!id || !email || !name || !dob || !country) {
            console.warn(`Invalid data at row ${index + 2}: ${row}`);
            return;
          }

          const formattedDob = this.formatDob(dob);
          
          const user = {
              id: id,
              email: email,
              name: name,
              dob: formattedDob,
              country: country.trim(),
          };

          // Map by ID
          this.usersIdMap.set(user.id, user);

          // Map user's indexes using the new index map
          this.indexesMap.set(user.id, {
              country: this.addToMap(this.usersCountryMap, user.country, user),
              dob: this.addToMap(this.usersDobMap, user.dob, user),
              namePrefix: this.addNamePrefixes(user.name, user)
          });
      });
  }

  /**
   * Adds a user to the specified map and returns the index.
   */
  addToMap(map, key, user) {
      if (!map.has(key)) {
          map.set(key, []);
      }
      const userList = map.get(key);
      userList.push(user);
      return userList.length - 1;  
  }

  /**
   * Adds prefixes (min of 3 chars) to the name prefixes map and returns the map of prefix-index.
   * @param {string} name
   * @param {User} user
   * @returns {Map<string, number>} - prefix:index 
   */
  addNamePrefixes(name, user) {
      const prefixIndexes = new Map();
      const fullName = name.toLowerCase();
      const [firstName, lastName] = name.toLowerCase().split(' ');

      // Add full name as a prefix
      if (!this.usersPrefixMap.has(fullName)) {
          this.usersPrefixMap.set(fullName, []);
      }
      const fullNameUsers = this.usersPrefixMap.get(fullName);
      const fullNameIndex = fullNameUsers.length;
      prefixIndexes.set(fullName, fullNameIndex); 
      fullNameUsers.push(user);
      
      // handle partial name prefixes
      [firstName, lastName].forEach(namePart => {
          if (namePart) {
              for (let i = 3; i <= namePart.length; i++) {
                  const prefix = namePart.slice(0, i);
                  if (!this.usersPrefixMap.has(prefix)) {
                      this.usersPrefixMap.set(prefix, []);
                  }
                  const prefixUsers = this.usersPrefixMap.get(prefix);
                  const prefixIndex = prefixUsers.length;
                  prefixIndexes.set(prefix, prefixIndex);  //  prefix:index in the map
                  prefixUsers.push(user);
              }
          }
      });

      return prefixIndexes;  // Return the map of prefix:index pairs
  }

    /**
     * @param {string} dob DD/MM/YYYY
     * @returns {string} Formatted dob with padded month and day
    */
    formatDob(dob){
      const [day, month, year] = dob.split('/');
      const formattedDay = day.padStart(2, '0');
      const formattedMonth = month.padStart(2, '0');
      return `${formattedDay}/${formattedMonth}/${year}`;
    }
}

module.exports = new MemoryDB();
