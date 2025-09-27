import React from 'react';

interface UserListProps {
    users: Set<string>;
    currentUser: string | null;
}

const UserList: React.FC<UserListProps> = ({ users, currentUser }) => {
    const sortedUsers = Array.from(users).sort((a, b) => {
        if (a === currentUser) return -1;
        if (b === currentUser) return 1;
        return a.localeCompare(b);
    });

    return (
        <aside className="hidden md:flex flex-col w-64 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Active Users ({users.size})
            </h2>
            <div className="overflow-y-auto">
                <ul className="space-y-3">
                    {sortedUsers.map(user => (
                        <li key={user} className="flex items-center text-sm text-gray-700 dark:text-gray-300 animate-fade-in">
                            <span className="h-2.5 w-2.5 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                            <span className="font-medium truncate">{user}</span>
                            {user === currentUser && <span className="ml-2 text-xs text-gray-500">(You)</span>}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default UserList;