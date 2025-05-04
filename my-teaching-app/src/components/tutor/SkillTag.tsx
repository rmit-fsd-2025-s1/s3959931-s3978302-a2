import React from "react";

interface SkillTagProps {
    skill: string;
    onRemove?: (skill: string) => void;
}

const SkillTag: React.FC<SkillTagProps> = ({ skill, onRemove }) => {
    return (
        <div className="skill-tag inline-flex items-center px-2 py-1 rounded-full text-sm mr-2 mb-2">
            {skill}
            {onRemove && (
                <button onClick={() => onRemove(skill)} className="ml-1 skill-tag-remove">
                    ×
                </button>
            )}
        </div>
    );
};

export default SkillTag;
