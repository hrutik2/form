from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.errors import PyMongoError

from app.core.config import settings

client = MongoClient(
    settings.mongodb_uri,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=5000,
)
db = client[settings.database_name]


def ensure_indexes():
    # Keep this out of module import so the app can boot even if Mongo is temporarily unavailable.
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.forms.create_index([("updated_at", DESCENDING)])
    db.forms.create_index([("status", ASCENDING), ("updated_at", DESCENDING)])
    db.submissions.create_index([("form_id", ASCENDING), ("submitted_at", DESCENDING)])
    db.form_recipients.create_index([("form_id", ASCENDING), ("email", ASCENDING)])
    db.form_recipients.create_index([("token", ASCENDING)], unique=True)


def ping_database():
    try:
        client.admin.command("ping")
        return True
    except PyMongoError:
        return False
