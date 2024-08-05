const { createClient } = supabase;
const supabaseClient = createClient(
  "https://zzalsobevusrwlgyahaj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWxzb2JldnVzcndsZ3lhaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjUyNTksImV4cCI6MjAzNzUwMTI1OX0.H8hlotvviqMWAhUs8nMju1s81uMbffzPYwHC_G-LJoM",
);
const newPodButton = document.getElementById("NewPod");
const JoinPod = document.getElementById("JoinPod");
const podsDIV = document.getElementById("podList");
let pods = [];
let user = undefined;
const { data: userData, error: userError } =
  await supabaseClient.auth.getUser();
setTimeout(() => {
  if (userData.user !== null) {
    user = userData.user.email || "";
  }
}, 1000);
class Pod {
  constructor(name, id) {
    this.name = name;
    this.users = [user];
    if (id) {
      this.id = id;
    } else {
      this.id = Math.floor((Date.now() % 1000000000) + Math.random() * 1000);
    }
  }
}
function podLissener(id) {
  document.getElementById(id).addEventListener("click", async () => {
    console.log(id);
  });
}
async function insertPod(id, pod, users) {
  try {
    const { error } = await supabaseClient
      .from("pods")
      .insert({ id: id, pod: pod, users: users });

    if (error) throw error;
  } catch (error) {
    console.error("Error inserting message:", error.message);
  }
}
function renderPods() {
  podsDIV.innerHTML = ""; // Clear the container before appending new elements
  pods.forEach((pod) => {
    let button1 = document.createElement("button");
    button1.textContent = pod.name;
    button1.className = "podbutton";
    button1.id = pod.id;
    podsDIV.appendChild(button1);
    podLissener(pod.id);
  });
}
async function fetchData() {
  try {
    const { data, error } = await supabaseClient.from("pods").select();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return [];
  }
}
function getPodByID(id) {
  return fetchData()
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          return data[i]; // Found the matching pod
        }
      }
      return null; // Return null if no matching pod is found
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error; // Optionally rethrow the error if you want to handle it further up the chain
    });
}

function buttons() {
  newPodButton.addEventListener("click", async () => {
    const podName = prompt("Enter the name of the new pod");
    if (podName) {
      // Check if a name was entered
      const newPod = new Pod(podName);
      console.log(newPod.name, newPod.id);
      pods.push(newPod);
      insertPod(newPod.id, newPod.name, newPod.users);
      renderPods(); // Update the UI
    }
  });
  JoinPod.addEventListener("click", async () => {
    const inviteCode = prompt("Invite code???");
    try {
      const pod = await getPodByID(inviteCode); // Await the promise from getPodByID
      if (pod !== null) {
        pod.users.push(user); // Add the current user to the pod
        pods.push(new Pod(pod.pod, pod.id)); // Add the pod to the pods array
        renderPods();
        console.log(pods);
      }
    } catch (error) {
      console.error("Error retrieving pod:", error);
    }

    console.log(inviteCode); // Log the invite code
  });
}

buttons();
fetchData().then((data) => {
  // Assuming data is an array of objects

  // Output the original data
  console.log("POds", data);
  for (let i = 0; i < data.length; i++) {
    // Push new Pod object into the transformed array
    if (data[i].users.includes(user)) {
      pods.push(new Pod(data[i].pod, data[i].id));
    }
  }

  // Replace the original array with the transformed array
  // Render the new pods
  renderPods();
});
