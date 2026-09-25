import urllib.request, json, urllib.error
req = urllib.request.Request('https://oests-project.onrender.com/api/auth/send-otp/', data=json.dumps({'fullName':'Safa School', 'email':'safanauman830@gmail.com', 'password':'StrongPassword123!@#', 'phone':'03224775585', 'role':'school'}).encode(), headers={'Content-Type': 'application/json'})
try:
    res = urllib.request.urlopen(req)
    print('SUCCESS:', res.read().decode())
except urllib.error.HTTPError as e:
    print('ERROR:', e.read().decode())
except Exception as e:
    print('EXCEPTION:', str(e))
