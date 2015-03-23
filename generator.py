import json, requests, urllib2, random
from werkzeug.security import generate_password_hash
from loremipsum import generate_paragraph
import datetime
import dateutil.parser
from bson import json_util
#import json
import time

print '---------------------------------fetching users-----------------------'
url = 'http://127.0.0.1/api/people'
randomuser = urllib2.urlopen('http://api.randomuser.me/?results=10&seed='+str(random.randrange(0, 101, 2)))
user_data = randomuser.read()
results = json.loads(user_data)
file('userdata.json','w').write(user_data)
#results = randomuser.read()

users=results['results']
processed_users = []
headers = {'content-type': 'application/json'}
dt = datetime.datetime.now()
ts = int(time.time())

for raw_user in users:
    user = raw_user['user']
    user.pop('sha1')
    user.pop('sha256')
    user.pop('registered')
    user.pop('md5')
    user.pop('salt')
    user.pop('SSN')
    user.pop('cell')
    user.pop('version')
    user.pop('nationality')
    user['born'] = user.pop('dob')
    user['password_test']  = user['password']
    user['email_confirmed'] = True
    user['lastmessageseen'] = ts
    user['interests'] = []
    user['study'] = {
        'intermediate':"",
        'graduate':""
    }
    #user['testing_doc'] = []
    user['movies'] = []
    user['notifications'] = []
    user['accept_notifications'] = []
    user['conversations'] = []
    user['MatchedPeopleNotifications'] = []
    user['MatchedPeopleNotificCount'] = []
    user['password'] = generate_password_hash(user['password'])
    user['role'] = 'test'
    r = requests.post(url, data=json.dumps(user, default=json_util.default), headers=headers)
    file('userdata.json','w').write(r.content)
    resp = json.loads(r.content)
    print resp
    processed_users.append({'id': resp['_id'], 'etag': resp['_etag']})
print '---------------------------------Adding friends to users-----------------------'
print processed_users
uids = [x['id'] for x in processed_users]
for user in processed_users:
		friends=set(random.sample(uids,int(random.random()*10)))
		friends-set([user['id']])
		headers['If-Match'] = user['etag']
		friends_dict = {}
		friends_dict['friends'] = list(friends)
		print friends_dict
		print headers
		r = requests.patch(url + '/' + user['id'], data=json.dumps(friends_dict), headers=headers)
		print r.content
print '---------------------------------Adding posts to users-----------------------'
for user in processed_users:
    for _ in range(20):
				post={}
				post['type'] = 'text'
				post['author'] = user['id']
				post['content'] = generate_paragraph()[2]
				r = requests.post(url + '/' + user['id'] + '/posts', data=json.dumps(post), headers={'content-type': 'application/json'})
				print r.content
		
