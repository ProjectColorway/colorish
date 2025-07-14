const changelog: {
    description: string, changes: {
        title: string,
        type: "fixed" | "progress" | "added" | "improved",
        items: string[];
    }[];
} = {
    description: "Beta 2 is here! These are all the changes:",
    changes: [
        {
            title: "A new UI",
            type: "improved",
            items: [
                "Switched to a sidebar navigation model, with more segments",
                "Improved UI consistency"
            ]
        },
        {
            title: "Global Search Improvements",
            type: "improved",
            items: [
                "New GS expanded pages, that show more actions. Currently shown for sources, subject to change"
            ]
        }
    ]
};

export default changelog;
