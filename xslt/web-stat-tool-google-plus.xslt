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
    <wst:web-statistics source="google+">
      <xsl:apply-templates select="//div[@id='aggregateCount']"/>
    </wst:web-statistics>
  </xsl:template>

  <xsl:template match="div[@id='aggregateCount']">
    <wst:likes><wst:metric><xsl:value-of select="."/></wst:metric></wst:likes>
  </xsl:template>
</xsl:stylesheet>
