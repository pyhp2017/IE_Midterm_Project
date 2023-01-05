// The function sets a cookie by adding together the cookiename, the cookie value, and the expires string.
// The parameters of the function above are the name of the cookie (cname), 
// the value of the cookie (cvalue), and the number of days until the cookie should expire (exdays).
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// The function below gets the cookie by splitting the document.cookie string on the semicolon character.
// The function returns the value of the cookie if the cookie is found.
// If the cookie is not found, the function returns an empty string.
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// This function will fetch all the informations that we need to show to our users
async function get_user_informations(username){
    const user_info = await fetch("https://api.github.com/users/" + username, {
        method: 'GET',
        redirect: 'follow'      
    }).then(response => {
        // parse response to json
        return response.json();
    })
    .catch(error => {
        return error;
    })
    return user_info;
}

//This function will fetch all user repos
async function get_user_repos(username){
    const user_repos = await fetch("https://api.github.com/users/" + username + "/repos", {
        method: 'GET',
        redirect: 'follow'
    }).then(response => {
        // parse response to json
        return response.json();
    }).catch(error => {
        // Handle Error
        return error;
    })
    return user_repos;
}

//This function will find the maximum used language
async function find_maximum_used_language(user_repos){
    let languages = {}
    // Loop through all the repos and get the languages
    for(let i = 0; i < user_repos.length; i++){
        repo_language = user_repos[i].language
        if(repo_language){
            languages[repo_language] = (languages[repo_language] || 0) + 1;
        }
    }
    // Return The maximum used language
    return Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b);
}

// This function will show alert box
function show_error(){
    // Show error message
    document.getElementById("alert").style.display = "block";
    document.getElementById("error_message").innerHTML = "Please enter a valid username / something is wrong with your network";
}

// Submit Event Function
async function submit(){
    // Get given username
    let username = document.getElementById("github_username").value;
    // Get given method
    let method = document.getElementById("methods").value;

    // Check if the username is empty
    if(username == ""){
        show_error();
        return;
    }


    // get localdata based on method
    let local_data;
    if(method == "cookie"){
        local_data = getCookie(username);
    }else{
        // localstorage
        local_data = localStorage.getItem(username);
    }
    
    // If the username didn't exist in local fetch it again
    if(!local_data){
        // Get User Data based on given information
        const user_info = await get_user_informations(username).then(async(data)=>{
            // get user favorite language
            const favorite_lang = await get_user_repos(username).then((repos)=>{
                // Get the maximum used language
                let favorite_language = find_maximum_used_language(repos);
                return favorite_language;
            })
            // Add favorite language to the data
            data.fav_language = favorite_lang;
            return data; 
        }).catch((error)=>{
            // Handle Error
            console.log(error);
            show_error();
        })

        if(method == "cookie"){
            // Set Cookie
            setCookie(username, JSON.stringify(user_info), 1);
        }else {
            // Add user data to localstorage
            localStorage.setItem(username, JSON.stringify(user_info));
        }
    
        // Apply information to the DOM
        apply_information(user_info);
    }else {
        // Apply given informations (from localstorage)
        apply_information(JSON.parse(local_data));
    }
}

// Apply information to the DOM
function apply_information(data){
    document.getElementById("github_avatar").src = data.avatar_url;
    document.getElementById("github_fullname").innerHTML = data.name;
    document.getElementById("github_bio").innerHTML = data.bio;
    document.getElementById("github_followers").innerHTML = data.followers;
    document.getElementById("github_following").innerHTML = data.following;
    document.getElementById("github_public_repos").innerHTML = data.public_repos;
    document.getElementById("github_public_gists").innerHTML = data.public_gists;
    document.getElementById("github_location").innerHTML = data.location;
    document.getElementById("github_company").innerHTML = data.company;
    document.getElementById("github_blog").innerHTML = data.blog;
    document.getElementById("github_email").innerHTML = data.email;
    document.getElementById("github_type").innerHTML = data.type;
    document.getElementById("github_hireable").innerHTML = data.hireable;
    document.getElementById("github_twitter").innerHTML = data.twitter_username;
    document.getElementById("github_url").href = data.html_url;
    document.getElementById("github_url").innerHTML = data.login;  
    document.getElementById("github_language").innerHTML = data.fav_language;
}
