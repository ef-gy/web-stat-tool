<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
              xmlns:wst="https://github.com/ef-gy/web-stat-tool"
              xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
              version="1.0">
  <xsl:output method="xml" encoding="UTF-8"
              indent="no"
              media-type="application/xml" />

  <xsl:strip-space elements="*"/>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*|node()" />
    </xsl:copy>
  </xsl:template>

  <xsl:template match="/">
    <wst:web-statistics source="alexa">
      <xsl:apply-templates select="//strong"/>
    </wst:web-statistics>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][ancestor::span[contains(@data-cat,'globalRank')]]">
    <wst:rank scope="global"><xsl:value-of select="."/></wst:rank>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][ancestor::span[contains(@data-cat,'countryRank')]]">
    <wst:rank scope="country" area="{../../h4/a/@title}"><xsl:value-of select="."/></wst:rank>
  </xsl:template>

  <xsl:template match="*[contains(@class,'metrics-data')]">
    <wst:metric><xsl:value-of select="."/></wst:metric>
  </xsl:template>

  <xsl:template match="strong"/>
</xsl:stylesheet>
