from .app import socket_manager as sm

@sm.on("join")
async def join(sid, *args, **kwargs):
    print("join", sid, args, kwargs)
    await sm.emit("join", sid, *args, **kwargs)

@sm.on("leave")
async def leave(sid, *args, **kwargs):
    print("leave", sid, args, kwargs)
    await sm.emit("leave", sid, *args, **kwargs)