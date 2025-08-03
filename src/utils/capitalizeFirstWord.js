export const capitalizeBranch = (branch) => {
    if (!branch) return 'Not assigned';
    return branch.charAt(0).toUpperCase() + branch.slice(1);
  };