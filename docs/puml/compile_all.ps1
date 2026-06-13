# Compile all .puml files to PNG in docs/images/
# Run from anywhere — paths are resolved automatically
# Usage: .\docs\puml\compile_all.ps1

$docsDir   = Split-Path $PSScriptRoot -Parent
$pumlDir   = $PSScriptRoot
$imagesDir = Join-Path $docsDir "images"
$jar       = Join-Path $docsDir "plantuml.jar"

if (-not (Test-Path $jar)) {
    Write-Error "plantuml.jar not found at: $jar"
    exit 1
}

$pumlFiles = Get-ChildItem -Path $pumlDir -Filter "*.puml"

if ($pumlFiles.Count -eq 0) {
    Write-Host "No .puml files found in $pumlDir"
    exit 1
}

Write-Host "Compiling $($pumlFiles.Count) diagram(s) to $imagesDir ..."

foreach ($file in $pumlFiles) {
    Write-Host "  -> $($file.Name)"
    java -jar $jar -tpng -o $imagesDir $file.FullName
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "  ERROR compiling $($file.Name)"
    }
}

Write-Host ""
Write-Host "Done."
