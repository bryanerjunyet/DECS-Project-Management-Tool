export const compareTokens = async (tok1, tok2) => {
    try {
        const res = await fetch(`http://localhost:3001/users/compare_tokens?user_token_1=${tok1}&user_token_2=${tok2}`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            }
        });
        if (!res.ok) {
            throw new Error(res.message);
        }

        const resData = await res.json();

        if (resData.result === null) {
            throw new Error("Invalid tokens.");
        } else if (resData.result) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Failed to compare tokens:', error);
    }
}