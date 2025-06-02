import React from "react";
import styles from "./skill-tag.module.css";

interface SkillTagProps {
  skill: string;
  onRemove?: (skill: string) => void;
}

const SkillTag: React.FC<SkillTagProps> = ({ skill, onRemove }) => {
  return (
    <div className={styles.skillTag}>
      {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          className={styles.skillTagRemove}
          aria-label={`Remove skill ${skill}`}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SkillTag;
