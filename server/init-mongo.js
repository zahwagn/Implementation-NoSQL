db = db.getSiblingDB('nosql_media');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('media');
db.createCollection('tickets');
db.createCollection('venues');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.media.createIndex({ "title": 1 });
db.media.createIndex({ "type": 1 });
db.tickets.createIndex({ "user": 1 });
db.tickets.createIndex({ "media": 1 });

print('Database initialized successfully');