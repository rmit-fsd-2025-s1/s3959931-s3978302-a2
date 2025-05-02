import React from "react";

interface SkillTagProps {
    skill: string;
    onRemove?: (skill: string) => void;
}

const SkillTag: React.FC<SkillTagProps> = ({ skill, onRemove }) => {
    return (
        <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm mr-2 mb-2">
            {skill}
            {onRemove && (
                <button
                    onClick={() => onRemove(skill)}
                    className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    ×
                </button>
            )}
        </div>
    );
};

export default SkillTag;
