const { createClient } = supabase
const supabase2 = createClient('https://zzalsobevusrwlgyahaj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6YWxzb2JldnVzcndsZ3lhaGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MjUyNTksImV4cCI6MjAzNzUwMTI1OX0.H8hlotvviqMWAhUs8nMju1s81uMbffzPYwHC_G-LJoM');
let submit = document.getElementById('submit');
const ul = document.getElementById('dataList');
function addListItem(text, user) {
    // Create a new LI element for the text
    const textItem = document.createElement('li');
    textItem.textContent = text;
    
    // Create a new LI element for the user
    const userItem = document.createElement('li');
    userItem.textContent = user;
    
    // Get the UL element
    
    // Append the new LI elements to the UL
    ul.appendChild(textItem);
    ul.appendChild(userItem);
}
async function data_to_list() {
    let data = await fetchData();
    ul.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        addListItem(data[i].message,data[i].user);
    }
    setTimeout(data_to_list, 5000);
}
await data_to_list();
submit.addEventListener('click', async function() {
    let message = document.getElementById('message').value;
    let user = document.getElementById('user').value;
    await insertMessage("home",message,user);
    await data_to_list();
})
async function insertMessage(group,m,u) {
  const { error } = await supabase2
    .from(group)
    .insert({ message: m, user: u });

  if (error) {
    // Handle error here
    console.error('Error inserting country:', error.message);
  } else {
    // Handle success if needed
    console.log('Country inserted successfully');
  }
}

async function fetchData() {
    try {
        const { data, error } = await supabase2
            .from('home')
            .select();
            
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            console.log('Data:', data);
            return data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
