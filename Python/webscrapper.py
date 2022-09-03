from selenium import webdriver
from selenium.webdriver.edge.options import Options
from bs4 import BeautifulSoup
import json

print("Note: Do not close this window. It will destroy itself after the process is completed.\n")

options = Options()
options.headless = True

driver = webdriver.Chrome(
    options=options, executable_path="msedgedriver.exe")
driver.get("https://cebcare.ceb.lk/Incognito/DemandMgmtSchedule")

soup = BeautifulSoup(driver.page_source, 'html.parser')
driver.quit()

results = soup.find_all(class_="badge border border-light text-light fw-500")

fe = [i for i in soup.select(
    "#calendar > div.fc-view-container > div > table > tbody > tr > td > div.fc-scroller.fc-time-grid-container > div > div.fc-content-skeleton > table > tbody > tr > td:nth-child(2) > div > div:nth-child(2) > a")]

object = {}
for i in fe:
    duration = i.findChildren('span')[0].text
    area = i.findChildren('span')[1].text
    if area not in object.keys():
        object[area] = []
    object[area].append(duration)

with open("schedules.json", 'w') as file:
    file.write(json.dumps(object))
