let counter = 0;
let quantity = 4;
let posts_count = 0;
function exit_modal(e) {
  e.stopPropagation();
  let modal = document.getElementById("modal_post");
  let post = document.getElementById("post");
  post.style.transform = "translateY(200%)";
  setTimeout(() => {
    modal.style.display = "none";
    modal.style.top = "0";
    post.style.transform = "translateY(-200%)";
  }, 500);
}
async function get_csrf() {
  const resp1 = await fetch("getCsrf", {
    credentials: "include",
  });
  const data1 = await resp1.json();
  const csrf_token = data1.csrf_token;
  return csrf_token;
}
async function post_post() {
  let formError = document
    .getElementsByClassName("post_form")[0]
    .getElementsByTagName("h6")[0];
  const formData = new FormData(
    document.getElementsByClassName("post_form")[0]
  );
  if (formData.get("body") != "") {
    formError.textContent = "";
    const csrf_token = await get_csrf();
    const resp = await fetch("posts", {
      method: "POST",
      headers: {
        "X-Csrftoken": csrf_token,
      },
      body: formData,
    });
    if (!resp.ok) {
      formError.textContent = "failed to post";
    } else {
      exit_modal();
    }
  } else {
    if (formData.get("body") == "") bodyTextarea.style.border = "solid red 2px";
    else bodyTextarea.style.border = "";

    formError.textContent = "please fill required data";
  }
}

function create_post_form() {
  let post = document.getElementById("post");
  post.innerHTML = "";
  const form = document.createElement("form");
  form.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  form.classList.add("post_form");
  form.method = "POST";
  const bodyFieldset = document.createElement("fieldset");

  const bodyLabel = document.createElement("label");
  bodyLabel.setAttribute("for", "body");
  bodyLabel.textContent = "body: ";

  const bodyTextarea = document.createElement("textarea");
  bodyTextarea.name = "body";
  bodyTextarea.id = "body";
  bodyTextarea.cols = 30;
  bodyTextarea.rows = 5;
  bodyTextarea.placeholder = "Body";

  bodyFieldset.appendChild(bodyLabel);
  bodyFieldset.appendChild(bodyTextarea);

  const imageFieldset = document.createElement("fieldset");

  const imageLabel = document.createElement("label");
  imageLabel.setAttribute("for", "image");
  imageLabel.textContent = "add image: ";
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.id = "image";
  imageInput.name = "image";
  imageInput.style.display = "none";

  const imageInputBtn = document.createElement("button");
  imageInputBtn.textContent = "Add Image";
  imageInputBtn.classList.add("btn");
  imageInputBtn.classList.add("image_btn");
  imageInputBtn.addEventListener("click", (e) => {
    e.preventDefault();
    imageInput.click();
  });

  imageFieldset.appendChild(imageLabel);
  imageFieldset.appendChild(imageInput);
  imageFieldset.appendChild(imageInputBtn);
  const formError = document.createElement("h6");
  formError.style.color = "red";
  const submitButton = document.createElement("input");
  submitButton.type = "submit";
  submitButton.id = "submit_btn";
  submitButton.classList.add("btn");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    post_post();
  });
  form.appendChild(bodyFieldset);
  form.appendChild(imageFieldset);
  form.appendChild(formError);
  form.appendChild(submitButton);

  // You can now append this form element to your desired location in the DOM
  post.appendChild(form);
}
async function view_all_posts() {
  document.getElementById("all_posts").style.display = "block";
  document.getElementById("following").style.display = "none";
  document.getElementById("profile_page").style.display = "none";
  counter = 0;
  const resp = await fetch("postsCount", {
    method: "GET",
  });
  posts_count = (await resp.json()).count;
  load_next_post();
}
function view_followings() {
  document.getElementById("all_posts").style.display = "none";
  document.getElementById("following").style.display = "block";
  document.getElementById("profile_page").style.display = "none";
}
function view_profile_page() {
  document.getElementById("all_posts").style.display = "none";
  document.getElementById("following").style.display = "none";
  document.getElementById("profile_page").style.display = "block";
}
document.addEventListener("DOMContentLoaded", async () => {
  const csrf_token = await get_csrf();
  const resp2 = await fetch("getFollowed", {
    method: "POST",
    headers: {
      "X-Csrftoken": csrf_token,
      "Content-Type": "application/json",
    },
  });
  const data2 = await resp2.json();
  console.log(data2);
  let modal = document.getElementById("modal_post");
  modal.addEventListener("click", exit_modal);
  view_all_posts();
  document.getElementById("new_post").addEventListener("click", () => {
    let post = document.getElementById("post");
    create_post_form();
    let exit_btn = document.createElement("button");
    exit_btn.addEventListener("click", exit_modal);
    exit_btn.innerHTML = `<i class="fa-solid fa-x"></i>`;
    exit_btn.classList.add("exit_btn");
    modal.append(exit_btn);
    modal.style.top = "0";
    modal.style.display = "block";
    setTimeout(() => {
      post.style.transform = "translateY(-50%)";
    }, 0);
  });
  document
    .getElementById("following_page_link")
    .addEventListener("click", (e) => {
      e.preventDefault();
      counter = 0;
      view_followings();
    });
  document
    .getElementById("profile_page_link")
    .addEventListener("click", (e) => {
      e.preventDefault();
      counter = 0;
      view_profile_page();
    });
  document.getElementById("all_posts_link").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("posts").innerHTML = "";
    view_all_posts();
  });
  window.addEventListener("scroll", () => {
    console.log(counter);
    console.log(posts_count);
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight &&
      !(counter >= posts_count)
    ) {
      load_next_post();
      console.log("adel");
    }
  });
});

async function load_next_post() {
  let start = counter;
  let end = start + quantity - 1;
  counter = end;
  let resp = await fetch(`posts?start=${start}&end=${end}`, {
    method: "GET",
  });
  let data = await resp.json();
  new Promise((resolve) => {
    document.getElementsByClassName("spinner")[0].style.display = "block";
    setTimeout(() => {
      resolve();
    }, 700);
  }).then(() => {
    for (let i = 0; i < data.postings.length; i++) {
      create_post_card(data.postings[i], document.getElementById("posts"));
    }
    document.getElementsByClassName("spinner")[0].style.display = "none";
  });
}
async function create_profile_page(user_id) {
  document.getElementById("profile_page").innerHTML = "";
  counter = 0;
  view_profile_page();
  const resp = await fetch(`user/${user_id}`, {
    method: "GET",
  });
  const user_data = await resp.json();
  console.log(user_data);
  const profileSection = document.createElement("section");
  profileSection.classList.add("profile_page");

  // Profile header
  const profileHeader = document.createElement("div");
  profileHeader.classList.add("profile_header");

  const profileImage = document.createElement("img");
  profileImage.src = user_data.image; // Update with actual image source
  profileImage.alt = "profile image"; // Update with image description

  const profileName = document.createElement("div");
  profileName.classList.add("profile_name");

  const userName = document.createElement("h5");
  userName.textContent = `Username: ${user_data.username}`; // Update with actual username

  const userEmail = document.createElement("h5");
  userEmail.textContent = `Email: ${user_data.email}`;

  profileName.appendChild(userName);
  profileName.appendChild(userEmail);

  const followerCount = document.createElement("h5");
  followerCount.textContent = `Followers: ${user_data.followers}`;

  const followingCount = document.createElement("h5");
  followingCount.textContent = `Following: ${user_data.following}`;

  const followButton = document.createElement("button");
  followButton.textContent = followButton.textContent = user_data.followed
    ? "Unfollow"
    : "Follow";
  user_data.followed
    ? followButton.classList.add("followed")
    : followButton.classList.remove("followed");
  followButton.classList.add("btn");
  followButton.addEventListener("click", async () => {
    if (user_data.followed) {
      user_data.followers--;
      followerCount.textContent = `Followers: ${user_data.followers}`;
    } else {
      user_data.followers++;
      followerCount.textContent = `Followers: ${user_data.followers}`;
    }
    const csrf_token = await get_csrf();
    const resp1 = await fetch("follow", {
      method: "POST",
      headers: {
        "X-Csrftoken": csrf_token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        followed: user_data.email,
      }),
    });
    if (resp1.ok) {
      user_data.followed = !user_data.followed;
      user_data.followed
        ? followButton.classList.add("followed")
        : followButton.classList.remove("followed");
      followButton.textContent = user_data.followed ? "Unfollow" : "Follow";
    }
    const data1 = await resp1.json();
  });
  const followerContainer = document.createElement("div");
  followerContainer.appendChild(followerCount);
  followerContainer.appendChild(followingCount);

  profileHeader.appendChild(profileImage);
  profileHeader.appendChild(profileName);
  profileHeader.appendChild(followerContainer);
  if (!user_data.notLoggedIn) {
    profileHeader.appendChild(followButton);
  }

  // Profile body (content to be added later)
  const profileBody = document.createElement("div");
  profileBody.classList.add("profile_body");
  counter = user_data.posts.length;
  posts_count = user_data.posts.length;
  for (let i = 0; i < user_data.posts.length; i++) {
    create_post_card(user_data.posts[i], profileBody);
  }
  // Append everything to the profile section
  profileSection.appendChild(profileHeader);
  profileSection.appendChild(profileBody);

  // You can now add this section to your existing HTML element
  document.getElementById("profile_page").append(profileSection);
}

function create_post_card(post_data, view) {
  const postCard = document.createElement("section");
  postCard.classList.add("post_card");

  // Card Header
  const cardHeader = document.createElement("div");
  cardHeader.classList.add("card_header");
  const profile_link = document.createElement("a");
  profile_link.href = `/#${post_data.creator.username}`;
  profile_link.addEventListener("click", () => {
    create_profile_page(post_data.creator.id);
  });
  const creatorImage = document.createElement("img");
  creatorImage.src = `${post_data.creator.image}`; // Set the actual image source here
  creatorImage.alt = "creator profile picture";

  const creatorName = document.createElement("h5");
  creatorName.textContent = `${post_data.creator.username}`;
  profile_link.appendChild(creatorImage);
  profile_link.appendChild(creatorName);
  const postDate = document.createElement("h6");
  postDate.textContent = ""; // Replace with actual date
  let date = new Date(Date.now() - new Date(post_data.date).getTime());
  if (date.getFullYear() > 1970) {
    postDate.textContent =
      date.getFullYear() -
      1970 +
      (date.getFullYear() - 1970 == 1 ? " year ago" : " years ago");
  } else if (date.getMonth() > 0) {
    postDate.textContent =
      date.getMonth() +
      1 +
      (date.getMonth() + 1 == 1 ? " monthe ago" : " monthes ago");
  } else if (date.getDate() > 1) {
    postDate.textContent =
      date.getDate() - 1 + (date.getDate() - 1 == 1 ? " day ago" : " days ago");
  } else if (date.getHours() - 2 > 0) {
    postDate.textContent =
      date.getHours() -
      2 +
      (date.getHours() - 2 == 1 ? " hour ago" : " hours ago");
  } else if (date.getMinutes() > 0) {
    postDate.textContent =
      date.getMinutes() +
      (date.getMinutes() == 1 ? " minute ago" : " minutes ago");
  } else if (date.getSeconds() > 0) {
    postDate.textContent =
      date.getSeconds() +
      (date.getSeconds() - 1 == 1 ? " second ago" : " seconds ago");
  }
  setInterval(() => {
    date = new Date(Date.now() - new Date(post_data.date).getTime() + 10);
    if (date.getFullYear() > 1970) {
      postDate.textContent =
        date.getFullYear() -
        1970 +
        (date.getFullYear() - 1970 == 1 ? " year ago" : " years ago");
    } else if (date.getMonth() > 0) {
      postDate.textContent =
        date.getMonth() +
        1 +
        (date.getMonth() + 1 == 1 ? " monthe ago" : " monthes ago");
    } else if (date.getDate() > 1) {
      postDate.textContent =
        date.getDate() -
        1 +
        (date.getDate() - 1 == 1 ? " day ago" : " days ago");
    } else if (date.getHours() - 2 > 0) {
      postDate.textContent =
        date.getHours() -
        2 +
        (date.getHours() - 2 == 1 ? " hour ago" : " hours ago");
    } else if (date.getMinutes() > 0) {
      postDate.textContent =
        date.getMinutes() +
        (date.getMinutes() == 1 ? " minute ago" : " minutes ago");
    } else if (date.getSeconds() > 0) {
      postDate.textContent =
        date.getSeconds() +
        (date.getSeconds() - 1 == 1 ? " second ago" : " seconds ago");
    }
  }, 10000);
  cardHeader.appendChild(profile_link);
  cardHeader.appendChild(postDate);

  // Separator
  const separator1 = document.createElement("hr");

  // Card Body
  const cardBody = document.createElement("div");
  cardBody.classList.add("card_body");

  const postImage = document.createElement("img");
  postImage.src = `${post_data.image}`; // Set the actual image source here
  postImage.alt = "post image";

  const postTitle = document.createElement("p");
  postTitle.textContent = post_data.body;
  if (post_data.image != "") {
    cardBody.appendChild(postImage);
  }
  cardBody.appendChild(postTitle);

  // Separator
  const separator2 = document.createElement("hr");

  // Card Footer
  const cardFooter = document.createElement("div");
  cardFooter.classList.add("card_footer");

  const likeButton = document.createElement("button");
  const likeIcon = document.createElement("i");
  likeIcon.classList.add(
    `fa-${post_data.liked ? "solid" : "regular"}`,
    "fa-thumbs-up"
  );
  const likesCount = document.createElement("h6");
  likesCount.textContent = post_data.likes;
  likeButton.appendChild(likeIcon);
  likeButton.appendChild(likesCount);
  likeButton.classList.add("post_btn");
  likeButton.addEventListener("click", async () => {
    const csrf_token = await get_csrf();
    let resp = await fetch("like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Csrftoken": csrf_token,
      },
      body: JSON.stringify({
        post_id: post_data.id,
      }),
    });
    if (resp.ok) {
      let data = await resp.json();
      console.log(data);
      if (data.message == "success") {
        if (post_data.liked == true) {
          post_data.likes--;
          likeButton.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> <h6>${post_data.likes}</h6>`;
        } else {
          post_data.likes++;
          likeButton.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> <h6>${post_data.likes}</h6>`;
        }
        post_data.liked = !post_data.liked;
      }
    }
  });
  const shareButton = document.createElement("button");
  const shareIcon = document.createElement("i");
  shareIcon.classList.add("fa-solid", "fa-share");
  shareButton.classList.add("post_btn");
  // const id = document.createElement("input");
  // id.value = post_data.id;
  // id.setAttribute("id", "id");
  // id.setAttribute("type", "hidden");
  shareButton.appendChild(shareIcon);
  cardFooter.appendChild(likeButton);
  cardFooter.appendChild(shareButton);
  // cardFooter.appendChild(id);
  // Assemble the post card
  postCard.appendChild(cardHeader);
  postCard.appendChild(separator1);
  postCard.appendChild(cardBody);
  postCard.appendChild(separator2);
  postCard.appendChild(cardFooter);
  view.appendChild(postCard);
}
