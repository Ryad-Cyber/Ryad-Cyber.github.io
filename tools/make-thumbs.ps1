# =============================================================
#  Génère les vignettes de la section Voyages.
#
#  Lit toutes les .jpeg de assets/voyages/ et écrit dans
#  assets/voyages/thumbs/ une version réduite à 480 px sur le
#  grand côté, en qualité 78. Les originaux ne sont jamais
#  modifiés ; les vignettes existantes sont réécrites.
#
#  Usage, depuis la racine du projet :
#      powershell -ExecutionPolicy Bypass -File tools\make-thumbs.ps1
# =============================================================

Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot "..\assets\voyages" | Resolve-Path
$dst = Join-Path $src "thumbs"
if (-not (Test-Path $dst)) { New-Item -ItemType Directory -Path $dst | Out-Null }

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters -ArgumentList 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter -ArgumentList `
    ([System.Drawing.Imaging.Encoder]::Quality), ([long]78)

foreach ($f in (Get-ChildItem "$src\*.jpeg" | Sort-Object Name)) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)

    # Redresse selon l'orientation EXIF : System.Drawing ne le fait pas,
    # alors que le navigateur le fait sur l'original. Sans ça, la vignette
    # et la photo en pleine taille n'auraient pas le même sens.
    $o = 1
    if ($img.PropertyIdList -contains 274) { $o = $img.GetPropertyItem(274).Value[0] }
    switch ($o) {
        3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
        6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
        8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
    }

    $scale = 480 / [Math]::Max($img.Width, $img.Height)
    if ($scale -gt 1) { $scale = 1 }
    $w = [int][Math]::Round($img.Width * $scale)
    $h = [int][Math]::Round($img.Height * $scale)

    $bmp = New-Object System.Drawing.Bitmap -ArgumentList $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose()

    # Encodage en mémoire puis écriture des octets : GDI+ garde un
    # handle sur le fichier quand on lui passe un chemin, ce qui fait
    # échouer la réécriture d'une vignette déjà présente.
    $out = Join-Path $dst $f.Name
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, $codec, $ep)
    [System.IO.File]::WriteAllBytes($out, $ms.ToArray())
    $ms.Dispose()
    $bmp.Dispose()
    $img.Dispose()

    "{0,-26} {1,4}x{2,-4} {3,4} Ko" -f $f.Name, $w, $h, [math]::Round((Get-Item $out).Length / 1KB)
}

$total = (Get-ChildItem "$dst\*.jpeg" | Measure-Object Length -Sum).Sum
"`nTotal : {0} vignettes, {1} Ko" -f (Get-ChildItem "$dst\*.jpeg").Count, [math]::Round($total / 1KB)
"Penser a reporter les dimensions (width/height) dans les deux index.html."
