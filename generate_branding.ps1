Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(600, 200)
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.Clear([System.Drawing.Color]::Transparent)
$gfx.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

$font1 = New-Object System.Drawing.Font("Segoe UI", 16)
$font2 = New-Object System.Drawing.Font("Segoe UI", 24, [System.Drawing.FontStyle]::Bold)
$brush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Gray)
$brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)

$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center

$gfx.DrawString("from", $font1, $brush1, 300, 50, $format)
$gfx.DrawString("CodeWave Systems", $font2, $brush2, 300, 80, $format)

$bmp.Save("d:\Jikki\projeccts\resident-nexus-ui-main\resident-nexus-ui-main\android\app\src\main\res\drawable\branding.png", [System.Drawing.Imaging.ImageFormat]::Png)
