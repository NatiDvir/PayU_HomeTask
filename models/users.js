const MemoryDB = require('../datastore/MemoryDB'); 

class User {
    constructor(id, email, name, dob, country) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.dob = dob;
        this.country = country;
    }

    /**
     * Calculate user's age based on birthday in DD/MM/YYYY format
     * @returns {string}
     */
    getAge() {
        const [day, month, year] = this.dob.split('/');
        const birthDate = new Date(`${year}-${month}-${day}`);
        const currentDate = new Date();

        let age = currentDate.getFullYear() - birthDate.getFullYear();
        const monthDifference = currentDate.getMonth() - birthDate.getMonth();

        if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
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
    static getByAge(age) {
        return MemoryDB.usersAgeMap.get(age) || [];
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

        // Remove from usersIdMap
        MemoryDB.usersIdMap.delete(id);

        // Remove from usersCountryMap
        const countryUsers = MemoryDB.usersCountryMap.get(user.country).filter(u => u.id !== id);
        MemoryDB.usersCountryMap.set(user.country, countryUsers);

        // Remove from usersAgeMap
        const age = user.getAge();
        const ageUsers = MemoryDB.usersAgeMap.get(age).filter(u => u.id !== id);
        MemoryDB.usersAgeMap.set(age, ageUsers);

        // Remove from usersPrefixMap
        const [firstName, lastName] = user.name.toLowerCase().split(' ');
        [firstName, lastName].forEach(namePart => {
            if (namePart) {
                User.removeFromNamePrefix(namePart, id);
            }
        });

        return true;
    }

    /**
     * Deletes a user by their ID and removes them from all relevant Maps.
     * Operates in linear time (O(n)) because for each shared attribute (country, age, name),
     * we have to filter out the user from the list associated with that attribute.
     * @param {string} name 
     * @param {string} id 
     */
    static removeFromNamePrefix(name, id) {
        for (let i = 3; i <= name.length; i++) {
            const prefix = name.slice(0, i);
            const users = MemoryDB.usersPrefixMap.get(prefix);
            if (users) {
                MemoryDB.usersPrefixMap.set(prefix, users.filter(u => u.id !== id));
            }
        }
    }
}

module.exports = User;
