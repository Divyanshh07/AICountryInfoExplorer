const input = document.getElementById("countryInput");
const resultDiv = document.getElementById("result");
const suggestionsDiv = document.getElementById("suggestions");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");

searchBtn.addEventListener("click", getCountry);

// 🔍 Live Suggestions
input.addEventListener("input", async () => {
    const query = input.value.trim();
    if (query.length < 2) {
        suggestionsDiv.style.display = "none";
        return;
    }

    try {
        const res = await fetch(`https://restcountries.com/v3.1/all`);
        const countries = await res.json();

        const filtered = countries
            .map(c => c.name.common)
            .filter(name => name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 6);

        if (filtered.length > 0) {
            suggestionsDiv.innerHTML = filtered.map(n => `<p>${n}</p>`).join("");
            suggestionsDiv.style.display = "block";

            document.querySelectorAll(".suggestions p").forEach(el =>
                el.addEventListener("click", () => {
                    input.value = el.innerText;
                    suggestionsDiv.style.display = "none";
                    getCountry();
                })
            );
        } else {
            suggestionsDiv.style.display = "none";
        }
    } catch {
        suggestionsDiv.style.display = "none";
    }
});

async function getCountry() {
    const country = input.value.trim();
    suggestionsDiv.style.display = "none";

    if (country === "") {
        resultDiv.innerHTML = `<p>Please enter a country name.</p>`;
        return;
    }

    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${country}?fullText=true`);
        if (!response.ok) throw new Error("Country not found");

        const data = await response.json();
        const c = data[0];

        const name = c.name.common;
        const capital = c.capital ? c.capital[0] : "N/A";
        const region = c.region;
        const population = c.population.toLocaleString();
        const area = c.area.toLocaleString();
        const languages = c.languages ? Object.values(c.languages).join(", ") : "N/A";
        const currency = c.currencies ? Object.values(c.currencies)[0].name : "N/A";
        const borders = c.borders || [];
        const flag = c.flags.png;
        const latlng = c.latlng;

        let borderFlagsHTML = "";
        if (borders.length > 0) {
            const borderRes = await fetch(`https://restcountries.com/v3.1/alpha?codes=${borders.join(",")}`);
            const borderData = await borderRes.json();
            borderFlagsHTML = borderData
                .map(b => `<img src="${b.flags.png}" title="${b.name.common}" alt="${b.name.common}">`)
                .join("");
        }

        const summary = `${name} is located in ${region}. Its capital is ${capital}, it covers an area of ${area} km² and has a population of ${population}. The main language(s) spoken are ${languages}, and the currency used is ${currency}.`;

        resultDiv.innerHTML = `
      <div class="country-card">
        <img src="${flag}" alt="Flag of ${name}">
        <h2>${name}</h2>
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Region:</strong> ${region}</p>
        <p><strong>Population:</strong> ${population}</p>
        <p><strong>Area:</strong> ${area} km²</p>
        <p><strong>Languages:</strong> ${languages}</p>
        <p><strong>Currency:</strong> ${currency}</p>
        <p><strong>Summary:</strong> ${summary}</p>
        <div class="map-container">
          <iframe src="https://www.google.com/maps?q=${latlng[0]},${latlng[1]}&hl=en&z=5&output=embed"></iframe>
        </div>
        ${
            borders.length
                ? `<h3>Neighbouring Countries:</h3><div class="border-flags">${borderFlagsHTML}</div>`
                : `<p><em>No bordering countries.</em></p>`
        }
      </div>
    `;
    } catch (error) {
        resultDiv.innerHTML = `<p>❌ ${error.message}</p>`;
    }
}

// 🌙 Dark/Light Mode Toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const darkMode = document.body.classList.contains("dark");
    themeToggle.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
});

// Load saved theme
window.addEventListener("load", () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️ Light Mode";
    }
});
