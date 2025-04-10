$gitPath = "C:\Program Files\Git\cmd\git.exe"
$repoUrl = "https://github.com/Root-FTW/Schema-Analyzer.git"

# Inicializar Git
& $gitPath init

# Configurar usuario y email (reemplaza con tus datos)
& $gitPath config user.name "Root-FTW"
& $gitPath config user.email "tu-email@example.com"

# Agregar todos los archivos
& $gitPath add .

# Hacer commit
& $gitPath commit -m "Versión inicial del Schema.org Analyzer"

# Agregar el repositorio remoto
& $gitPath remote add origin $repoUrl

# Cambiar el nombre de la rama principal a main (GitHub usa main por defecto)
& $gitPath branch -M main

# Subir los cambios
& $gitPath push -u origin main

Write-Host "Proceso completado. Verifica tu repositorio en GitHub."
