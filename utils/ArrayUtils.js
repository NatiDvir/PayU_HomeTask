const MemoryDB = require('../datastore/MemoryDB')

/**
 * Removes a user from a map's users array by swapping it with the last element, then popping the array.
 * Ensures O(1) complexity for deletion.
 * @param {Array} usersArray 
 * @param {number} index 
 * @param {string} mapType 
 * @param {string} prefix - Optional prefix used for namePrefix maps.
 */
function swapAndPop(usersArray, index, mapType, prefix = null) {
    if (index < 0 || index >= usersArray.length) {
        throw new Error("Invalid index");
    }

    // If user is not the last one, swap it with the last user
    if (index !== usersArray.length - 1) {
        usersArray[index] = usersArray[usersArray.length - 1]; 

        const replacedUser = usersArray[index];

        if (MemoryDB.indexesMap.has(replacedUser.id)) {
            const replacedUserIndexes = MemoryDB.indexesMap.get(replacedUser.id);
            switch (mapType) {
                case 'country':
                    replacedUserIndexes.country = index;
                    break;
                case 'dob':
                    replacedUserIndexes.dob = index;
                    break;
                case 'namePrefix':
                    if (prefix) {
                        replacedUserIndexes.namePrefix.set(prefix, index);
                    }
                    break;
                default:
                    throw new Error("Invalid mapType");
            }
        }
    }

    usersArray.pop();
}

module.exports = {
    swapAndPop
};
