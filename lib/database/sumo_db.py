#!/usr/local/bin/python

"""
This is the database module for all tasks on sumotools. It inherits from db.py for all the
heavy lifting.
"""

import os
from . import db

os_env = os.environ

engine = db.init_engine(os_env['SQLALCHEMY_SUMO_URI'])

class Db(db.Database):
    def __init__(self, 
                 database_name = 'support_mozilla_com',
                 is_persistent = False):
        super(Db, self).__init__(database_name, engine, is_persistent)
    
