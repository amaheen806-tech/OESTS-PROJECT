import urllib.request, json, urllib.error
req = urllib.request.Request('https://oests-project.onrender.com/api/auth/send-otp/', data=json.dumps({'fullName':'test', 'email':'safanauman830@gmail.com', 'password':'StrongPassword123!@#', 'phone':'03112233445', 'role':'donor'}).encode(), headers={'Content-Type': 'application/json'})
try:
    res = urllib.request.urlopen(req)
    print(res.read().decode())
except urllib.error.HTTPError as e:
    print('ERROR:', e.read().decode())
