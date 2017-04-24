import time
import uuid
import hashlib
from random import randint
import string
import random
import sys
import json
import couchdb

def hash_newblock():
    key0 = str(int(round(time.time() * 1000)))
    key1 = str(randint(0,10000))
    key2 = str(randint(0,10000))
    key3 = str(randint(0,10000))
    key4 = str(randint(0,10000))
    key5 = str(randint(0,10000))
    key6 = str(randint(0,10000))
    key7 = str(randint(0,10000))
    key8 = str(randint(0,10000))
    key9 = str(randint(0,10000))
    data = key0 + key1 +key2 +key3 +key4 +key5 +key6 +key7 +key8 + key9
    # uuid is used to generate a random number
    spnd = str(data) + str(randint(0,10000)) + str(int(round(time.time() * 1000))) + ''.join([random.choice(string.ascii_letters + string.digits) for n in range(32)])
    salt2 = uuid.uuid4().hex
    return 'blk_' + hashlib.sha256(salt2.encode() + spnd.encode()).hexdigest()
    
init_reward = int(10)

try:
    couch = couchdb.Server('http://user:pass@10.99.0.12:5986/')
    dbcouch = couch['block']
    map_fun = '''function(doc) { if (doc.type == 'block')  emit(doc.block, null); }'''
    nodb = len(dbcouch.query(map_fun))
except Exception as e:
    print('Error on line {}'.format(sys.exc_info()[-1].tb_lineno), type(e), e)
    quit()
else:
    if nodb > 500000 and nodb <= 5000000:
        blockreward = init_reward * 1 / 5
        block = hash_newblock()
        datetime = int(time.time())
        docins = {'type': 'block', 'block': block, 'blockreward' : blockreward, 'datetime' : datetime, 'counthash' : 0, 'statusreward' : 0, 'status' : 0}
        rid = dbcouch.save(docins)[0]
        rshow = json.dumps(dbcouch.get(rid))
        print(rshow)
        quit()
    elif nodb > 100000 and nodb <= 500000:
        blockreward = init_reward * 2 / 5
        block = hash_newblock()
        datetime = int(time.time())
        docins = {'type': 'block', 'block': block, 'blockreward' : blockreward, 'datetime' : datetime, 'counthash' : 0, 'statusreward' : 0, 'status' : 0}
        rid = dbcouch.save(docins)[0]
        rshow = json.dumps(dbcouch.get(rid))
        print(rshow)
        quit()
    elif nodb > 10000 and nodb <= 100000:
        blockreward = init_reward * 3 / 5
        block = hash_newblock()
        datetime = int(time.time())
        docins = {'type': 'block', 'block': block, 'blockreward' : blockreward, 'datetime' : datetime, 'counthash' : 0, 'statusreward' : 0, 'status' : 0}
        rid = dbcouch.save(docins)[0]
        rshow = json.dumps(dbcouch.get(rid))
        print(rshow)
        quit()
    elif nodb > 1000 and nodb <= 10000:
        blockreward = init_reward * 4 / 5
        block = hash_newblock()
        datetime = int(time.time())
        docins = {'type': 'block', 'block': block, 'blockreward' : blockreward, 'datetime' : datetime, 'counthash' : 0, 'statusreward' : 0, 'status' : 0}
        rid = dbcouch.save(docins)[0]
        rshow = json.dumps(dbcouch.get(rid))
        print(rshow)
        quit()
    elif nodb >= 0 and nodb <= 1000:
        blockreward = init_reward * 5 / 5
        block = hash_newblock()
        datetime = int(time.time())
        docins = {'type': 'block', 'block': block, 'blockreward' : blockreward, 'datetime' : datetime, 'counthash' : 0, 'statusreward' : 0, 'status' : 0}
        rid = dbcouch.save(docins)[0]
        rshow = json.dumps(dbcouch.get(rid))
        print(rshow)
        quit()
    else:
        blockreward = 1
        block = hash_newblock()
        datetime = int(time.time())
        docins = {'type': 'block', 'block': block, 'blockreward' : blockreward, 'datetime' : datetime, 'counthash' : 0, 'statusreward' : 0, 'status' : 0}
        rid = dbcouch.save(docins)[0]
        rshow = json.dumps(dbcouch.get(rid))
        print(rshow)
        quit()