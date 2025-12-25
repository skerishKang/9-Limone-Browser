Add-Type -AssemblyName System.Drawing
$src = "g:\\Ddrive\\BatangD\\task\\workdiary\\9-Limone-Browser\\icon.png"
$sizes = @(16,48,128)

foreach($s in $sizes){
    $bmp = [System.Drawing.Image]::FromFile($src)
    try {
        $resized = New-Object System.Drawing.Bitmap($bmp, $s, $s)
        $dest = Join-Path (Split-Path $src) ("icon{0}.png" -f $s)
        $resized.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "saved $dest"
    }
    finally {
        $bmp.Dispose()
        if($resized){ $resized.Dispose() }
    }
}
