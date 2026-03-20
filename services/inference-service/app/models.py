from .extensions import db
from datetime import datetime, timezone


class Scan(db.Model):
    __tablename__ = 'scans'

    id             = db.Column(db.Integer,   primary_key=True)
    user_id        = db.Column(db.String,    nullable=False, index=True) 
    result         = db.Column(db.Integer,   nullable=False)              # severity grade 0-4
    date           = db.Column(db.DateTime,  nullable=False, default=lambda: datetime.now(timezone.utc))

    # lesion counts
    blackhead     = db.Column(db.Integer,   nullable=False, default=0)
    darkspot      = db.Column(db.Integer,   nullable=False, default=0)
    papule        = db.Column(db.Integer,   nullable=False, default=0)
    pustule       = db.Column(db.Integer,   nullable=False, default=0)
    whitehead     = db.Column(db.Integer,   nullable=False, default=0)
    nodule        = db.Column(db.Integer,   nullable=False, default=0)

    def to_dict(self):
        return {
            'id':             self.id,
            'user_id':        self.user_id,
            'result':         self.result,
            'date':           self.date.isoformat(),
            'blackhead':     self.blackhead,
            'darkspot':      self.darkspot,
            'papule':        self.papule,
            'pustule':       self.pustule,
            'whitehead':     self.whitehead,
            'nodule':        self.nodule,
        }


class Recommendation(db.Model):
    __tablename__ = 'recommendations'

    id         = db.Column(db.Integer,  primary_key=True)
    user_id    = db.Column(db.String,   nullable=False, index=True)
    content    = db.Column(db.Text,     nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id':         self.id,
            'user_id':    self.user_id,
            'content':    self.content,
            'created_at': self.created_at.isoformat(),
        }