// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(
  "https://zzalsobevusrwlgyahaj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWxzb2JldnVzcndsZ3lhaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjUyNTksImV4cCI6MjAzNzUwMTI1OX0.H8hlotvviqMWAhUs8nMju1s81uMbffzPYwHC_G-LJoM",
);
import { encrypt, decrypt } from "./encryption.js";
import { fetchUserEmail } from "./supabase.js";
import { getCurretPod as getCurrentPod, getPodByID } from "./pods.js";
// DOM elements
let REDIRECTURL = "https://judemakes.dev/family/src/";
const submitButton = document.getElementById("submit");
const ul = document.getElementById("dataList");
const sidebar = document.querySelector(".sidebar");
const newGroupButton = document.getElementById("New");
const loginButton = document.getElementById("LOGIN");
const chatArea = document.getElementById("chat-area");
const trash = document.getElementById("trashcan");
const podList = document.getElementById("podList");
let currentGroup = "home";
let isTexting = true;
let loggedInEmail = "";
let AREWELOGEDIN = null;
let all_groups = [];

// Call the function to create and insert the elements
function removeBUTTON(id) {
  if (AREWELOGEDIN) {
    document.getElementById(id).remove();
  }
}
function initEventListeners() {
  loginButton.addEventListener("click", signInWithGithub);
  trash.addEventListener("click", async () => {
    const groupId = currentGroup;
    const { data, error } = await supabaseClient
      .from("messages")
      .delete()
      .eq("group", groupId); // Ensure 'group' is the column name and 'groupId' is the value to match

    if (error) {
      console.error("Error deleting message:", error);
    } else {
    }
    removeBUTTON(currentGroup);
  });

  newGroupButton.addEventListener("click", async () => {
    if (AREWELOGEDIN) {
      const groupName = prompt("Enter the group name");
      if (groupName === null || groupName.trim() === "") {
        alert("Group name cannot be empty");
        return;
      }

      if (all_groups.includes(groupName)) {
        alert("Group already exists");
        return;
      }

      all_groups.push(groupName);
      currentGroup = groupName;
      insertMessage(
        "messages",
        `New group ${groupName} created`,
        loggedInEmail,
      );
    }
  });
}

// Add event listener for sidebar group buttons
function addGroupButtonEventListener(button) {
  button.addEventListener("click", async () => {
    currentGroup = button.textContent;
  });
}

// Initialize groups in the sidebar
let savedPod = null;
async function initGroups() {
  if (savedPod !== null) {
    if (savedPod.id !== (await getCurrentPod().id)) {
      document.getElementById("groups").innerHTML = "";
      console.log("Pod changed");
      all_groups = [];
    }
  }
  if (!AREWELOGEDIN) {
    // Schedule the function to run again after 1 second if not logged in
    setTimeout(initGroups, 1000);
    return;
  }

  try {
    const groups = await fetchData();

    // Store current pod information to avoid repeated calls
    const currentPod = getCurrentPod(); // Fixed typo: `getCurretPod` -> `getCurrentPod`
    if (currentPod === null) {
      setTimeout(initGroups, 1000);
      return;
    }

    const currentPodId = currentPod.id;

    for (const group of groups) {
      // Check if the group has not already been added and the current pod ID matches
      if (!all_groups.includes(group.group) && currentPodId === group.pod) {
        const groupButton = document.createElement("button");
        groupButton.textContent = group.group;
        groupButton.className = "group";
        groupButton.id = group.group;
        document.getElementById("groups").appendChild(groupButton);
        addGroupButtonEventListener(groupButton);
        all_groups.push(group.group);
      }
    }
  } catch (error) {
    console.error("Error initializing groups:", error);
  }

  // Schedule the function to run again after 1 second
  savedPod = getCurrentPod();
  setTimeout(initGroups, 1000);
}

// Fetch and display data in the list
async function updateDataList() {
  if (!AREWELOGEDIN) return;

  try {
    const data = await fetchData();
    ul.innerHTML = "";

    const filteredData = data.filter(
      (item) => item.group.toLowerCase() === currentGroup.toLowerCase(),
    );
    let newData = [];
    for (let i = 0; i < filteredData.length; i++) {
      if (getCurrentPod() !== null) {
        console.log(filteredData[i].pod, getCurrentPod().id);
        if (filteredData[i].pod === getCurrentPod().id) {
          newData.push(filteredData[i]);
          console.log("Data", filteredData[i]);
        }
      }
    }
    console.log(newData);
    newData.forEach((item) => addListItem(item.message, item.user));

    setTimeout(updateDataList, 1000);
  } catch (error) {
    console.error("Error updating data list:", error.message);
  }
}

// Add a new list item to the data list
function addListItem(text, user) {
  let decrypted = decrypt(text, 3);
  const div = document.createElement("div");
  div.className = "message";
  div.id = Date.now();
  div.innerHTML = `
    <li class="user">${user}</li>
    <li>${decrypted}</li>
  `;
  ul.appendChild(div);
}

// Handle message submission
async function handleSubmit(event) {
  if (isTexting && AREWELOGEDIN) {
    event.preventDefault();
    const message = document.getElementById("message").value;
    document.getElementById("message").value = "";
    await insertMessage("messages", message, loggedInEmail);
  } else {
    alert("You are not logged in or texting is disabled");
  }
}

// Insert a new message into the database
async function insertMessage(group, message, user) {
  let encryted = encrypt(message, 3);
  try {
    const { error } = await supabaseClient.from(group).insert({
      message: encryted,
      user,
      group: currentGroup,
      pod: await getCurrentPod().id,
    });

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

async function signInWithGithub() {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: REDIRECTURL,
      },
    });

    if (error) throw error;

    // Retrieve user information
    if (userError) throw userError;
  } catch (error) {
    console.error("Authentication error:", error.message);
  }
}

// Function to update the display based on the current group
function updateDisplay() {
  chatArea.style.display = isTexting ? "flex" : "none";
}
function loop() {
  if (AREWELOGEDIN) {
    document.getElementById("logedin").innerHTML = loggedInEmail;
  }
  updateDisplay();

  setTimeout(loop, 1000);
}
// Initialization function
async function init() {
  loggedInEmail = await fetchUserEmail();
  if (loggedInEmail !== null) {
    AREWELOGEDIN = true;
  }
  initEventListeners();
  await initGroups();
  loop();
  updateDataList();
  submitButton.addEventListener("click", handleSubmit);
}

// Execute initialization function
init();
