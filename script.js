async function getAccountRatings() {
    const codeforcesUsername = document.getElementById('codeforcesUsername').value;
    const leetcodeUsername = document.getElementById('leetcodeUsername').value;
    const gfgUsername = document.getElementById('gfgUsername').value;
    const ratingsElement = document.getElementById('ratings');
    
    ratingsElement.textContent = 'Fetching ratings...';

    const urls = {
        codeforces: `https://codeforces.com/api/user.info?handles=${codeforcesUsername}`,
        leetcode: `https://leetcode-stats-api.herokuapp.com/${leetcodeUsername}`,
        gfg: `https://gfgstats.onrender.com/?userName=${gfgUsername}`
    };

    try {
        const responses = await Promise.all([
            codeforcesUsername ? fetch(urls.codeforces) : null,
            leetcodeUsername ? fetch(urls.leetcode) : null,
            gfgUsername ? fetch(urls.gfg) : null
        ].filter(Boolean));

        const data = await Promise.all(responses.map(async (res, index) => {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await res.json();
            } else {
                console.error(`Response for ${Object.keys(urls)[index]} is not JSON:`, await res.text());
                throw new Error(`Response for ${Object.keys(urls)[index]} is not JSON`);
            }
        }));

        console.log('Codeforces Response:', data[0]);
        console.log('LeetCode Response:', data[1]);
        console.log('GFG Response:', data[2]);

        let ratingsHtml = '';

        // Codeforces
        if (codeforcesUsername) {
            if (data[0] && data[0].status === 'OK') {
                const cfRating = data[0].result[0].rating;
                ratingsHtml += `<p>Codeforces Rating: ${cfRating}</p>`;
            } else {
                ratingsHtml += `<p>Codeforces Rating: User not found or API error</p>`;
            }
        }

        // LeetCode
        if (leetcodeUsername) {
            if (data[1] && data[1].status === 'success') {
                const lcRanking = data[1].ranking || 'N/A';
                const lcTotalSolved = data[1].totalSolved || 'N/A';
                const lcContestRating = data[1].contestRating || 'N/A';

                ratingsHtml += `<p>LeetCode Ranking: ${lcRanking}</p>`;
                ratingsHtml += `<p>LeetCode Total Problems Solved: ${lcTotalSolved}</p>`;
                ratingsHtml += `<p>LeetCode Contest Rating: ${lcContestRating}</p>`;
            } else {
                ratingsHtml += `<p>LeetCode Rating: User not found or API error</p>`;
            }
        }

        // GeeksforGeeks
        if (gfgUsername) {
            if (data[2] && data[2].status === 'Success') {
                const gfgTotalSolved = data[2].data.TotalProblemSolved || 'N/A';
                ratingsHtml += `<p>GeeksforGeeks Total Problems Solved: ${gfgTotalSolved}</p>`;
            } else {
                ratingsHtml += `<p>GeeksforGeeks Rating: User not found or API error</p>`;
            }
        }

        ratingsElement.innerHTML = ratingsHtml;
    } catch (error) {
        ratingsElement.textContent = 'Failed to fetch ratings.';
        console.error('There was a problem with the fetch operation:', error);
    }
}
