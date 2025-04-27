document.getElementById("gigForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("You're not logged in.");
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById("gigForm");
  const formData = new FormData(form);  // Collect form data

  // Log form data to check if title, description, and category are not empty
  formData.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  // Check if title, description, and category are filled
  if (!formData.get('title') || !formData.get('description') || !formData.get('category')) {
    alert("Please fill out all required fields.");
    return;
  }

  try {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
      },
      body: formData,
    });

    const result = await res.json();
console.log(result);  // Add this line to log the response data

    if (res.ok) {
      alert("Gig posted successfully!");
      form.reset();
      window.location.href = "marketplace.html";
    } else {
      alert(result.message || "Something went wrong.");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Network error.");
  }
});



  