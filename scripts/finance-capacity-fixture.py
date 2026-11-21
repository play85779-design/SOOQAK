"""Offline capacity model. Indexed synthetic catalog, logical users and stub providers."""
import sqlite3
from collections import Counter

def exercise(users):
    db = sqlite3.connect(':memory:')
    db.executescript('CREATE TABLE ads(id INTEGER PRIMARY KEY,city INTEGER); CREATE INDEX browse ON ads(city,id); CREATE TABLE signin(id INTEGER PRIMARY KEY); CREATE TABLE pics(ad INTEGER, slot INTEGER, PRIMARY KEY(ad,slot));')
    ads = users // 5
    db.executemany('INSERT INTO ads VALUES(?,?)', ((i,i%10) for i in range(ads)))
    db.executemany('INSERT INTO pics VALUES(?,?)', ((i,j) for i in range(ads) for j in range(3)))
    counters = Counter()
    for user in range(users):
        for _ in range(4):
            # Stub accepts one mail attempt per simulated user/window; repeated attempts are suppressed.
            if db.execute('INSERT OR IGNORE INTO signin VALUES(?)',(user,)).rowcount:
                counters['mail_fail' if user%10==0 else 'mail_ok']+=1
            else:
                counters['mail_suppressed']+=1
        for visit in range(5):
            rows=db.execute('SELECT id FROM ads WHERE city=? AND id>? ORDER BY id LIMIT 24',(user%10,visit)).fetchall()
            assert len(rows)<=24
            counters['pages']+=1
        if user%5==0:
            # Failed storage writes do not count as successful storage or trigger an unbounded retry.
            counters['storage_fail' if user%20==0 else 'storage_ok']+=1
    assert counters['mail_suppressed']==3*users and counters['pages']==5*users
    assert db.execute('SELECT count(*) FROM pics').fetchone()[0]==3*ads
    print(users,ads,3*ads,dict(counters))
    db.close()

if __name__=='__main__':
    for population in (100,1000,10000):
        exercise(population)
