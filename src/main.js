// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(
  "https://zzalsobevusrwlgyahaj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWxzb2JldnVzcndsZ3lhaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjUyNTksImV4cCI6MjAzNzUwMTI1OX0.H8hlotvviqMWAhUs8nMju1s81uMbffzPYwHC_G-LJoM"
);

// DOM elements
const submitButton = document.getElementById("submit");
const ul = document.getElementById("dataList");
const sidebar = document.querySelector(".sidebar");
const newGroupButton = document.getElementById("New");
const loginButton = document.getElementById("LOGIN");
const familyButton = document.getElementById("FAMILY");
const familyPage = document.getElementById("Family_Tracking");
const chatArea = document.getElementById("chat-area");

// State variables
let currentGroup = "home";
let isTexting = true;
let loggedInEmail = "";

// Initialize the map
function initMap() {
  const map = L.map('map').setView([34, -118], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  map.options.maxZoom = 19;
}

// Initialize event listeners
function initEventListeners() {
  loginButton.addEventListener("click", signInWithGithub);
  familyButton.addEventListener("click", () => {
    currentGroup = "family";
  });
  newGroupButton.addEventListener("click", async () => {
    const groupName = prompt("Enter the group name");
    if (groupName) {
      const newGroupButton = document.createElement("button");
      newGroupButton.textContent = groupName;
      newGroupButton.className = "group";
      sidebar.appendChild(newGroupButton);
      addGroupButtonEventListener(newGroupButton);
    }
  });
}

// Add event listener for sidebar group buttons
function addGroupButtonEventListener(button) {
  button.addEventListener("click", async () => {
    currentGroup = button.textContent;
    await updateDataList();
  });
}

// Initialize groups in the sidebar
async function initGroups() {
  const groups = await fetchData();
  groups.forEach(group => {
    const groupButton = document.createElement("button");
    groupButton.textContent = group.group;
    groupButton.className = "group";
    sidebar.appendChild(groupButton);
    addGroupButtonEventListener(groupButton);
  });
}

// Fetch and display data in the list
async function updateDataList() {
  try {
    const data = await fetchData();
    ul.innerHTML = "";
    data.filter(item => item.group.toLowerCase() === currentGroup.toLowerCase())
        .forEach(item => addListItem(item.message, item.user));

    setTimeout(updateDataList, 5000);
  } catch (error) {
    console.error("Error updating data list:", error.message);
  }
}

// Add a new list item to the data list
function addListItem(text, user) {
  const div = document.createElement("div");
  div.className = "message";
  div.innerHTML = `
    <li class="user">${user}</li>
    <li>${text}</li>
  `;
  ul.appendChild(div);
}

// Handle message submission
async function handleSubmit(event) {
  if (isTexting && loggedInEmail) {
    event.preventDefault();
    const message = document.getElementById("message").value;
    await insertMessage("messages", message, loggedInEmail);
    await updateDataList();
  } else {
    alert("You are not logged in or texting is disabled");
  }
}

// Insert a new message into the database
async function insertMessage(group, message, user) {
  try {
    const { error } = await supabaseClient
      .from(group)
      .insert({ message, user, group: currentGroup });

    if (error) throw error;
  } catch (error) {
    console.error("Error inserting message:", error.message);
  }
}

// Fetch data from the database
async function fetchData() {
  try {
    const { data, error } = await supabaseClient.from("messages").select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return [];
  }
}

// Sign in with GitHub
const { data: userData, error: userError } = await supabaseClient.auth.getUser();
async function signInWithGithub() {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "https://judemakes.dev/family/src",
      },
    });

    if (error) throw error;

    // Retrieve user information
    if (userError) throw userError;

    loggedInEmail = userData?.user?.email || "";
    console.log("Logged in as:", loggedInEmail);
    document.getElementById("logedin").innerHTML = loggedInEmail;
  } catch (error) {
    console.error("Authentication error:", error.message);
  }
}

// Function to update the display based on the current group
function updateDisplay() {
  familyPage.style.display = (currentGroup === "family" && loggedInEmail) ? "flex" : "none";
  chatArea.style.display = isTexting ? "flex" : "none";
}

// Function to loop for periodic updates

function loop() {
  document.getElementById("logedin").innerHTML = "LogedINAS" + userData.user.email;
  updateDisplay();
  requestAnimationFrame(loop);
}

// Initialization function
async function init() {
  initMap();
  initEventListeners();
  await initGroups();
  loop();
  submitButton.addEventListener("click", handleSubmit);
}

// Execute initialization function
init();
