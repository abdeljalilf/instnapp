from pytube import Playlist
from pytube import YouTube
playlists = []
dossiers = [2013,2014,2015,2016,2017,2018,2019,2020,2021,2023,2022,2023]
M=0
l=[]
while M != 1:
    a = input('entrer le lien: ')
    #b = input('entrer le nom du dossier: ')
    M = int(input('entrer M : '))
    #dossiers.append(b)
    playlists.append(a)
for j in range (len(playlists)):
    #print(j)
    vi = playlists[j]
    b = Playlist(vi)
    for i in b:
        v=YouTube(i)
        c = v.streams
        """for j in c:
            print(j.resolution)
        d=int(input('entrer le numero du qalite desire'))

        g=d-1"""
        g = 2
        """s = input("si vous volez determiner l'adresse du telechargement entrer 1, sinon entrer 0.  votre reponse:")
        if s== 1:
            u=input('entrer ladresse')
        else:"""
        u= 'C:/telechargement avec python/'+ str( dossiers[j] )
        l.append([c,g,u])

print("le nombre des video est",len(b),".")
w=input("tu veux comencer le telechargement ? votre reponse : ")
n=1
if w!= "non" : #or w=="OUI" or w=="Oui":
    for i in range(0,len(l)):
        l[i][0][l[i][1]].download(l[i][2])
        print("le video",n,"est telecharger")
        print("il vous reste",len(l)-n,"video")
        n=n+1
print("c'est fini,merci")
