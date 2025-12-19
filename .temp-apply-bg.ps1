# PowerShell script to apply LeagueBackground to all remaining league files
# This is a reference - actual changes will be done via multi_replace

$files = @(
    "standings.tsx",
    "statistics.tsx",
    "edit.tsx",
    "generate-schedule.tsx",
    "assign-groups.tsx",
    "add-team.tsx",
    "actions.tsx"
)

# For each file, need to:
# 1. Add import at top
# 2. Wrap ScrollView with LeagueBackground  
# 3. Remove backgroundColor from ScrollView style

Write-Host "Files to process: $($files.Count)"
