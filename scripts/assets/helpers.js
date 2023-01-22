const activeClassName = "selectbox-open";

const combination = {
  network: "",
  library: "",
};

const getSelectedCombination = () =>
  `${combination.network}-${combination.library}`;

const getSelectBoxes = () => document.querySelectorAll(".selectbox");
const getPosts = () => document.querySelectorAll(".post");

const onOutsideClick = (container) => {
  document.addEventListener("click", (event) => {
    if (
      container.classList.contains(activeClassName) &&
      !container.contains(event.target)
    ) {
      container.classList.remove(activeClassName);
    }
  });
};

const onPostSelect = () => {
  getPosts().forEach((post) => {
    if (post.getAttribute("data-combination") === getSelectedCombination()) {
      post.classList.add("post-active");
    } else {
      post.classList.remove("post-active");
    }
  });
};

const onOptionClick = (selectbox) => {
  const options = selectbox.querySelectorAll(".option");
  const selected = selectbox.querySelector(".selectbox-selected");
  const combinationKey = selectbox.getAttribute("data-select");

  const onClick = (option) => {
    selectbox.classList.remove(activeClassName);
    selected.querySelector("h3").innerText =
      option.querySelector(".option-name h4").innerText;
    combination[combinationKey] = option.getAttribute("data-value");
    onPostSelect();
  };

  onClick(options[0]);
  options.forEach((option) => {
    option.addEventListener("click", () => onClick(option));
  });
};

const prepareCodeComponents = () => {
  getPosts().forEach((post) => {
    post.querySelectorAll("pre").forEach((pre) => {
      const code = pre.querySelector("code");
      if (!code) return;
      const div = document.createElement("div");
      div.classList.add("code");
      wrap(pre, div);
      pre.innerHTML = "";
      let language = "ts";
      code.className.split(" ").forEach((oneClass) => {
        if (oneClass.startsWith("language-")) {
          language = oneClass.substring(9);
        }
      });
      const value = hljs.highlight(code.innerHTML, {
        language,
      }).value;
      code.innerHTML = htmlDecode(value);
      const copyContainer = document.createElement("div");
      const copySuccess = document.createElement("div");
      copySuccess.classList.add("copy-success");
    
      const copyButton = document.createElement("button");
      copyContainer.classList.add("copy");
      copySuccess.innerText = "copied!";
        copyContainer.appendChild(copySuccess);
        copyContainer.appendChild(copyButton);
      copyButton.addEventListener("click", async () => {
        copyContainer.classList.add("copy-done");
      
        await navigator.clipboard.writeText(code.innerText);
        setTimeout(() => {
          copyContainer.classList.remove("copy-done");
        }, 3000);
      });
      div.appendChild(copyContainer);
      pre.appendChild(code);
    });
  });
};

const handleLinks = () => {
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      link.setAttribute("target", "_self"); // was _blank
      e.stopPropagation();
    });
  });
};

window.onload = () => {
  getSelectBoxes().forEach((selectbox) => {
    const selected = selectbox.querySelector(".selectbox-selected");
    selected.addEventListener("click", () =>
      selectbox.classList.toggle(activeClassName)
    );

    onOptionClick(selectbox);
    onOutsideClick(selectbox);
  });

  prepareCodeComponents();
  handleLinks();
};

const wrap = (elToWrap, wrapper) => {
  elToWrap.before(wrapper); // so element doesn't move
  wrapper.append(elToWrap); // automatically moves wrapped element.
};

function htmlDecode(input) {
  return input.replace(/&amp;/g, '&');
}