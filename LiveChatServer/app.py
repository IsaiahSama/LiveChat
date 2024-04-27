from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi_socketio import SocketManager
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

sm = SocketManager(app=app, cors_allowed_origins=[], mount_location="/socket.io", socketio_path="")

templates = Jinja2Templates(directory="templates")

@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/chat")
async def chat(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

"""
Rooms will follow the following format:
room_code: { members: dict }
"""
rooms = {}

"""Members will be mapped in the following format:

sid: {username: str, rcode: strr}"""
members = {}

@sm.on("joinRoom")
async def join(sid, username:str, rcode:str, color:str, *args, **kwargs):
    print("join", sid, username, rcode, kwargs)
    current_room = rooms.setdefault(rcode, {"members": {}})

    if username in current_room["members"]:
        await sm.emit("error", to=sid, data="A member with the same username is already in this room. To join, please use a different username.")
        return
    
    current_room["members"][username] = color
    
    rooms[rcode] = current_room

    members[sid] = { "username": username, "rcode": rcode, "color": color }

    await sm.enter_room(sid, rcode)
    await sm.emit("joinedRoom", data={"rcode": rcode, "members": [(member_name, member_color) for member_name, member_color in current_room["members"].items()]}, to=sid)
    await sm.emit("updateClientMembers", list(current_room["members"].keys()), room=rcode)
    await sm.emit('memberJoined', data={"username":username, "color":color}, room=rcode)
    await sm.emit("notifyRoom", f"{username} has joined the conversation!" ,room=rcode)

@sm.on("updateServerText")
async def message(sid, rcode:str, username:str, content:str):
    room = rooms.get(rcode)
    if not room:
        return
    
    # room["content"] = content
    data = {"username": username, "content": content}
    await sm.emit("updateClientText", data, room=rcode, skip_sid=sid)

@sm.on("disconnect")
async def disconnect(sid, *args, **kwargs):
    member_info = members[sid]
    del rooms[member_info["rcode"]]["members"][member_info["username"]]
    
    await sm.leave_room(sid, member_info["rcode"])
    await sm.emit("updateClientMembers",  rooms[member_info["rcode"]]["members"], room=member_info["rcode"])
    await sm.emit('memberLeft', member_info["username"], room=member_info["rcode"])
    await sm.emit("notifyRoom", f"{member_info['username']} has left the conversation!" ,room=member_info["rcode"])
    del members[sid]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)