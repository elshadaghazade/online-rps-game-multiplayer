function checkGame () {
    var userId = window.localStorage.getItem('userId');

    if (!userId) {
        $('#registration').show();
        $('#game').hide();
    } else {
        $('#registration').hide();
        $('#game').show();

        startTheGame();
    }
}

function createNewUser () {
    var newUser = database.ref('users').push();
    var userId = newUser.key;
    var userName = $('#name').val();
    var data = {
        name: userName
    }

    newUser.set(data);
    window.localStorage.setItem('userId', userId);
    window.localStorage.setItem('userName', userName);
    checkGame();
}

function startTheGame () {
    var userId = window.localStorage.getItem('userId');
    var roomId = window.localStorage.getItem('roomId');

    if (userId && roomId) {
        database.ref('rooms/' + roomId + '/users/' + userId).once('value', function (snapshot) {
            var isPlaying = snapshot.val();
            
            if (isPlaying) {
                
            } else {
                createNewRoomOrJoin();
            }
        });
    } else {
        createNewRoomOrJoin();
    }
}

function createNewRoomOrJoin () {
    var userId = window.localStorage.getItem('userId');

    function createNewRoom () {
        var newRoom = database.ref('rooms').push();
        var data = {
            users: {}
        }

        data.users[userId] = {
            score: 0,
            currentChoice: ""
        }

        newRoom.set(data);
        window.localStorage.setItem('roomId', newRoom.key);
    }

    database.ref('rooms').once('value', function (snapshot) {
        var rooms = snapshot.val();
        var hasJoined = false;

        if (rooms) {
            for(let room of Object.entries(rooms)) {
                let userCount = Object.keys(room[1].users).length;

                if (userCount === 1) {
                    database.ref('rooms/' + room[0] + '/users/' + userId).set({
                        score: 0,
                        currentChoice: ""
                    });

                    window.localStorage.setItem('roomId', room[0]);
                    hasJoined = true;
                    break;
                }
            }

            if (!hasJoined) {
                createNewRoom();
            }
        } else {
            createNewRoom();
        }
            
    });
}

checkGame();

$('#registration form').on('submit', createNewUser);