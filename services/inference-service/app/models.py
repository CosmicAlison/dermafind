from .extensions import db
from datetime import datetime, timezone


class Scan(db.Model):
    __tablename__ = 'scans'

    id             = db.Column(db.Integer,   primary_key=True)
    user_id        = db.Column(db.String,    nullable=False, index=True)  # from X-User-Id header
    result         = db.Column(db.Integer,   nullable=False)              # severity grade 0-4
    date           = db.Column(db.DateTime,  nullable=False, default=lambda: datetime.now(timezone.utc))

    # lesion counts
    blackheads     = db.Column(db.Integer,   nullable=False, default=0)
    darkspots      = db.Column(db.Integer,   nullable=False, default=0)
    papules        = db.Column(db.Integer,   nullable=False, default=0)
    pustules       = db.Column(db.Integer,   nullable=False, default=0)
    whiteheads     = db.Column(db.Integer,   nullable=False, default=0)
    nodules        = db.Column(db.Integer,   nullable=False, default=0)

    recommendation  = db.relationship('Recommendation', back_populates='scan', uselist=False)

    def to_dict(self):
        return {
            'id':             self.id,
            'user_id':        self.user_id,
            'result':         self.result,
            'date':           self.date.isoformat(),
            'blackheads':     self.blackheads,
            'darkspots':      self.darkspots,
            'papules':        self.papules,
            'pustules':       self.pustules,
            'whiteheads':     self.whiteheads,
            'nodules':        self.nodules,
            'annotated_image': self.annotated_image,
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