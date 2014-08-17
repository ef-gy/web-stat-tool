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
      <xsl:apply-templates select="//*[contains(@class,'metrics-data')] | //*[contains(@class,'box1-r')]"/>
    </wst:web-statistics>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][ancestor::span[contains(@data-cat,'globalRank')]]">
    <wst:rank scope="global"><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:rank>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][ancestor::span[contains(@data-cat,'countryRank')]]">
    <wst:rank scope="country" area="{../../h4/a/@title}"><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:rank>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][contains(preceding-sibling::h4,'Daily Unique Visitors')]">
    <wst:unique-visitors time-frame="daily"><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:unique-visitors>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][contains(preceding-sibling::h4,'Daily Pageviews')]">
    <wst:page-views time-frame="daily"><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:page-views>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][contains(preceding-sibling::h4,'Monthly Unique Visitors')]">
    <wst:unique-visitors time-frame="monthly"><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:unique-visitors>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][contains(preceding-sibling::h4,'Monthly Pageviews')]">
    <wst:page-views time-frame="monthly"><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:page-views>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][contains(parent::div/preceding-sibling::h4,'Bounce Rate')]">
    <wst:bounce-rate><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:bounce-rate>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][contains(parent::div/preceding-sibling::h4,'Daily Pageviews per Visitor')]">
    <wst:page-views-per-visitor time-frame="daily"><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:page-views-per-visitor>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][contains(parent::div/preceding-sibling::h4,'Daily Time on Site')]">
    <wst:time-on-site time-frame="daily"><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:time-on-site>
  </xsl:template>

  <xsl:template match="strong[contains(@class,'metrics-data')][contains(parent::div/preceding-sibling::h4,'Search Visits')]">
    <wst:search-visits><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:search-visits>
  </xsl:template>

  <xsl:template match="span[contains(@class,'box1-r')][contains(preceding-sibling::h5,'Total Sites Linking In')]">
    <wst:inbound-links><wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric></wst:inbound-links>
  </xsl:template>

  <xsl:template match="*[contains(@class,'metrics-data') or contains(@class,'box1-r')]">
    <wst:metric><xsl:value-of select="translate(.,',','')"/></wst:metric>
  </xsl:template>
</xsl:stylesheet>
