const MemoryDB = require('../datastore/MemoryDB');
const { swapAndPop } = require('../utils/ArrayUtils')
class User {
    constructor(id, email, name, dob, country, mapIndexes) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.dob = dob;
        this.country = country;
    }

    /**
     * Get user by ID from memory
     * @param {string} id 
     * @returns {User | null} 
     */
    static getById(id) {
        return MemoryDB.usersIdMap.get(id) || null;
    }

    /**
     * Get users by country
     * @param {string} country 
     * @returns {User[] | []} 
     */
    static getByCountry(country) {
        return MemoryDB.usersCountryMap.get(country) || [];
    }

    /**
     * Get users by age
     * @param {string} age 
     * @returns {User[] | []} 
     */
    static getByDob(dob) {
        return MemoryDB.usersDobMap.get(dob) || [];
    }

    /**
     * Get users by name (full or partial match)
     * @param {string} name 
     * @returns {User[] | []} 
     */
    static getByName(name) {
        return MemoryDB.usersPrefixMap.get(name.toLowerCase()) || [];
    }

    /**
    * Delete user by ID and remove from all related maps
    * @param {string} id 
    * @returns {boolean}
    */
    static deleteById(id) {
        const user = MemoryDB.usersIdMap.get(id);
        if (!user) return false;

        const userIndexes = MemoryDB.indexesMap.get(id);

        // Remove from usersIdMap
        MemoryDB.usersIdMap.delete(id);

        // Remove from usersCountryMap
        const countryUsers = MemoryDB.usersCountryMap.get(user.country);
        if (countryUsers) {
            swapAndPop(countryUsers, userIndexes.country, 'country');
        }

        // Remove from usersDobMap
        const dobUsers = MemoryDB.usersDobMap.get(user.dob);
        if (dobUsers) {
            swapAndPop(dobUsers, userIndexes.dob, 'dob');
        }
        
        // Remove full name from userPrefixMap
        const fullName = user.name.toLowerCase();
        const fullNameUsers = MemoryDB.usersPrefixMap.get(fullName);
        if (fullNameUsers && userIndexes.namePrefix.has(fullName)) {
            const fullNameIndex = userIndexes.namePrefix.get(fullName);
            swapAndPop(fullNameUsers, fullNameIndex, 'namePrefix', fullName);
        }
        
        // Remove partial names from usersPrefixMap
        const [firstName, lastName] = fullName.split(' ');

        [firstName, lastName].forEach(name => {
            if (name) {
                User.removeFromNamePrefix(name, id);
            }
        });
        
        // Remove from indexesMap
        MemoryDB.indexesMap.delete(id);
        
        return true;
    }

    /**
     * Deletes a user by their ID and removes them from all relevant name prefixes.
     * @param {string} namePart
     * @param {string} id
     */
    static removeFromNamePrefix(namePart, id) {
        const userIndexes = MemoryDB.indexesMap.get(id);

        for (let i = 3; i <= namePart.length; i++) {
            const prefix = namePart.slice(0, i).toLowerCase();
            const users = MemoryDB.usersPrefixMap.get(prefix);

            if (users && userIndexes.namePrefix.has(prefix)) {
                const prefixIndex = userIndexes.namePrefix.get(prefix);

                if (prefixIndex !== undefined && users.length > prefixIndex) {
                    swapAndPop(users, prefixIndex, 'namePrefix', prefix);
                }
            }
        }
    }
}

module.exports = User;
